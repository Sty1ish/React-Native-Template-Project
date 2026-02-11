import { http, ApiResponse } from '../../../common/http';
import {
  LoginRequest,
  LoginResponse,
  RefreshAccessTokenResponse,
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
