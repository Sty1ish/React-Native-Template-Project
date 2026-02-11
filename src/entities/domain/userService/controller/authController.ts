import { http, ApiResponse } from '../../../common/http';
import {
  LoginRequest,
  LoginResponse,
  RefreshAccessTokenResponse,
  OAuthLoginRequest,
  OAuthLoginResponse,
} from '../dto/authDto';

/**
 * 이메일/비밀번호 로그인 (Public API)
 * JWT 토큰 쌍(accessToken + refreshToken)을 발급받습니다.
 */
export const loginApi = (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
  http<LoginResponse>('/auth/login', 'POST', {
    auth: 'none', // Public API - 토큰 불필요
    body: data,
  });

/**
 * OAuth 로그인 (Public API)
 * Firebase ID Token을 서버에 전달하여 우리 서버의 JWT를 발급받습니다.
 *
 * 플로우:
 * 1. Firebase 소셜 로그인 (Google/Apple) 또는 Email/Password 로그인
 * 2. Firebase에서 ID Token 획득
 * 3. 이 함수로 서버에 ID Token 전달 → 서버 JWT 발급
 */
export const oauthLoginApi = (
  data: OAuthLoginRequest,
): Promise<ApiResponse<OAuthLoginResponse>> =>
  http<OAuthLoginResponse>(`/auth/login/oauth2/${data.provider}`, 'POST', {
    auth: 'none',
    headers: {
      Authorization: `Bearer ${data.idToken}`,
    },
  });

/**
 * Access Token 재발급 (Public API)
 * X-Refresh-Token 헤더를 통해 새로운 Access Token을 발급받습니다.
 *
 * 주의: 이 함수는 일반적인 API 호출에서 직접 사용하지 않습니다.
 * TokenManager가 자동으로 만료 임박 시 호출합니다.
 * 수동으로 갱신이 필요한 특수한 상황에서만 사용하세요.
 */
export const refreshAccessTokenApi = (
  refreshToken: string,
): Promise<ApiResponse<RefreshAccessTokenResponse>> =>
  http<RefreshAccessTokenResponse>('/auth/access-token/refresh', 'POST', {
    auth: 'none', // Public API - 기존 JWT 대신 X-Refresh-Token 사용
    headers: {
      'X-Refresh-Token': refreshToken,
    },
  });
