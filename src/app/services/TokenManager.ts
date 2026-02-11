import { useUserStore } from '../../shared/store/userStore';

// ─── JWT 디코딩 유틸 ─────────────────────────────────────

/**
 * Base64url → Base64 변환 후 디코딩
 * React Native 환경에서도 동작하도록 폴리필 포함
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  // React Native 런타임의 global.atob 사용 (TS 타입에 없으므로 globalThis 경유)
  const globalAtob = (globalThis as any).atob as
    | ((s: string) => string)
    | undefined;
  if (typeof globalAtob === 'function') {
    return globalAtob(base64);
  }

  // 폴리필 (테스트 환경 등)
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < base64.length; i += 4) {
    const a = chars.indexOf(base64[i]);
    const b = chars.indexOf(base64[i + 1]);
    const c = chars.indexOf(base64[i + 2]);
    const d = chars.indexOf(base64[i + 3]);
    output += String.fromCharCode((a << 2) | (b >> 4));
    if (c !== 64) {
      output += String.fromCharCode(((b & 15) << 4) | (c >> 2));
    }
    if (d !== 64) {
      output += String.fromCharCode(((c & 3) << 6) | d);
    }
  }
  return output;
}

/**
 * JWT 토큰의 페이로드를 디코딩하여 클레임 객체를 반환합니다.
 * 어떤 파라미터든 담겨있을 수 있으므로 Record<string, any>로 리턴합니다.
 */
function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('유효하지 않은 JWT 형식입니다.');
    }
    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload);
  } catch (error) {
    console.error('[TokenManager] JWT 디코딩 실패:', error);
    return {};
  }
}

// ─── 토큰 만료 관련 ─────────────────────────────────────

function getTokenExpiryMs(token: string): number | null {
  const claims = decodeJwtPayload(token);
  if (typeof claims.exp !== 'number') {
    return null;
  }
  return claims.exp * 1000;
}

function isTokenExpired(token: string): boolean {
  const expiryMs = getTokenExpiryMs(token);
  if (expiryMs === null) {
    return true;
  }
  return Date.now() >= expiryMs;
}

/**
 * JWT의 만료까지 남은 시간이 threshold 이하인지 확인합니다.
 * @param thresholdMs 밀리초 단위 임계값 (기본: 60_000 = 1분)
 */
function isTokenExpiringSoon(
  token: string,
  thresholdMs: number = 60_000,
): boolean {
  const expiryMs = getTokenExpiryMs(token);
  if (expiryMs === null) {
    return true;
  }
  return expiryMs - Date.now() <= thresholdMs;
}

// ─── 토큰 갱신 뮤텍스 ─────────────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

/**
 * Access Token 갱신 API를 직접 호출합니다.
 * 순환 참조 방지를 위해 http() 대신 raw fetch + dynamic import 사용
 */
async function refreshAccessTokenRaw(
  refreshToken: string,
): Promise<{ accessToken: string; tokenType: string } | null> {
  // dynamic import로 순환 참조 방지
  const { USERS_API_URL } = await import('../../entities/common/http');

  try {
    const res = await fetch(`${USERS_API_URL}/auth/access-token/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Refresh-Token': refreshToken,
      },
    });

    if (!res.ok) {
      console.error('[TokenManager] 토큰 갱신 실패:', res.status);
      if (res.status === 401) {
        console.log('[TokenManager] Refresh Token 만료 → 로그아웃');
        useUserStore.getState().logout();
      }
      return null;
    }

    const json = await res.json();
    return json.data as { accessToken: string; tokenType: string };
  } catch (error) {
    console.error('[TokenManager] 토큰 갱신 네트워크 오류:', error);
    return null;
  }
}

// ─── TokenManager 클래스 (싱글톤) ─────────────────────────

/**
 * JWT 토큰 관리 싱글톤 서비스
 *
 * 책임:
 * - AccessToken은 메모리(인스턴스 내부)에만 보관 → 앱 종료 시 자연 소멸 (보안)
 * - RefreshToken은 userStore(Keychain persist)에 영속 저장 → 앱 재시작 시 복원
 * - 만료 임박(1분 미만) 시 자동 갱신 + 뮤텍스로 동시 다발 갱신 방지
 * - JWT 클레임 추출 (어떤 키든 범용)
 */
class TokenManagerService {
  /** AccessToken은 메모리에만 보관 (Keychain에 저장하지 않음) */
  private accessToken: string | null = null;
  private tokenType: string = 'Bearer';

  // ─── 토큰 getter ─────────────────────────────

  /** 현재 메모리에 보관 중인 AccessToken (raw) */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /** userStore(Keychain)에 영속 저장된 RefreshToken */
  getRefreshToken(): string | null {
    return useUserStore.getState().refreshToken;
  }

  // ─── 유효한 AccessToken 획득 ─────────────────

  /**
   * 유효한 Access Token을 반환합니다.
   * - 만료 임박(1분 미만)인 경우 자동 갱신을 시도합니다.
   * - 동시 다발 요청 시 뮤텍스로 단일 갱신만 실행합니다.
   * - 갱신 실패 또는 토큰 부재 시 null을 반환합니다.
   */
  async getValidAccessToken(): Promise<string | null> {
    if (!this.accessToken) {
      return null;
    }

    // 아직 유효하고 만료 임박하지 않은 경우
    if (!isTokenExpiringSoon(this.accessToken)) {
      return this.accessToken;
    }

    const refreshToken = this.getRefreshToken();

    // Refresh Token이 없으면 갱신 불가
    if (!refreshToken) {
      console.warn('[TokenManager] Refresh Token 없음 - 갱신 불가');
      return isTokenExpired(this.accessToken) ? null : this.accessToken;
    }

    // Refresh Token 자체가 만료된 경우 → 로그아웃
    if (isTokenExpired(refreshToken)) {
      console.log('[TokenManager] Refresh Token 만료 → 로그아웃');
      this.logout();
      return null;
    }

    // 뮤텍스: 이미 갱신 중이면 기존 Promise를 재사용
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const result = await refreshAccessTokenRaw(refreshToken);
        if (result) {
          this.accessToken = result.accessToken;
          this.tokenType = result.tokenType;
          console.log('[TokenManager] Access Token 갱신 완료');
          return result.accessToken;
        }
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  // ─── 로그인 / 로그아웃 ─────────────────────────

  /**
   * 로그인 성공 시 토큰을 저장합니다.
   * - AccessToken → 메모리 (이 인스턴스)
   * - RefreshToken → userStore(Keychain persist)
   */
  login(accessToken: string, refreshToken: string, tokenType: string): void {
    this.accessToken = accessToken;
    this.tokenType = tokenType;
    useUserStore.getState().setRefreshToken(refreshToken);
    console.log('[TokenManager] 로그인 - 토큰 저장 완료');
  }

  /**
   * 로그아웃 시 모든 토큰 및 유저 정보를 초기화합니다.
   * - AccessToken: 메모리에서 제거
   * - RefreshToken + User: userStore.logout()으로 Keychain까지 클리어
   */
  logout(): void {
    this.accessToken = null;
    this.tokenType = 'Bearer';
    refreshPromise = null;
    useUserStore.getState().logout();
    console.log('[TokenManager] 로그아웃 - 토큰 제거 완료');
  }

  // ─── JWT 클레임 접근 ─────────────────────────

  /**
   * 현재 AccessToken의 전체 JWT 페이로드를 반환합니다.
   */
  getAccessTokenClaims(): Record<string, any> | null {
    if (!this.accessToken) {
      return null;
    }
    return decodeJwtPayload(this.accessToken);
  }

  /**
   * 현재 AccessToken에서 특정 클레임 값을 추출합니다.
   *
   * @example
   * const userId = TokenManager.getClaim<number>('userId');
   * const role = TokenManager.getClaim<string>('role');
   */
  getClaim<T = any>(claimKey: string): T | undefined {
    if (!this.accessToken) {
      return undefined;
    }
    const claims = decodeJwtPayload(this.accessToken);
    return claims[claimKey] as T | undefined;
  }

  /**
   * 현재 AccessToken의 커스텀 클레임(표준 클레임 제외)을 반환합니다.
   */
  getCustomClaims(): Record<string, any> | null {
    if (!this.accessToken) {
      return null;
    }
    const standardClaims = new Set([
      'iss',
      'sub',
      'aud',
      'exp',
      'nbf',
      'iat',
      'jti',
    ]);
    const allClaims = decodeJwtPayload(this.accessToken);
    const custom: Record<string, any> = {};
    for (const [key, value] of Object.entries(allClaims)) {
      if (!standardClaims.has(key)) {
        custom[key] = value;
      }
    }
    return custom;
  }

  // ─── 상태 확인 ─────────────────────────

  /**
   * 현재 로그인(유효한 토큰 보유) 여부를 확인합니다.
   */
  isLoggedIn(): boolean {
    if (this.accessToken && !isTokenExpired(this.accessToken)) {
      return true;
    }
    // AccessToken이 만료/없어도, RefreshToken이 유효하면 갱신 가능 → 로그인 상태
    const refreshToken = this.getRefreshToken();
    return !!refreshToken && !isTokenExpired(refreshToken);
  }
}

// ─── 싱글톤 export ─────────────────────────

export const TokenManager = new TokenManagerService();
