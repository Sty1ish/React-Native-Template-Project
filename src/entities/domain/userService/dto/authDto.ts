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

// ─── 토큰 갱신 ─────────────────────────────────────

export interface RefreshAccessTokenResponse {
  accessToken: string;
  tokenType: string;
}
