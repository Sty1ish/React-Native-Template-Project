// ─── 로그인 ─────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

// ─── OAuth 로그인 ─────────────────────────────────

/** OAuth 로그인 요청: Firebase ID Token을 서버에 전달하여 JWT를 발급받습니다 */
export interface OAuthLoginRequest {
  /** OAuth 프로바이더 (예: 'google', 'apple', 'email') */
  provider: string;
  /** Firebase ID Token */
  idToken: string;
}

/** OAuth 로그인 응답 (LoginResponse와 동일) */
export type OAuthLoginResponse = LoginResponse;

// ─── 토큰 갱신 ─────────────────────────────────────

export interface RefreshAccessTokenResponse {
  accessToken: string;
  tokenType: string;
}
