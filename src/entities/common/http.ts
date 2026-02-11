import { TokenManager } from '../../app/services/TokenManager';

// TODO: 환경 변수 또는 설정 파일에서 관리 필요
export const USERS_API_URL = 'https://api.your-domain.com';

export interface ApiResponse<T = any> {
  timestamp: string;
  status: number;
  path: string;
  code: string;
  message: string;
  data: T;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * 인증 모드
 * - 'required': JWT 필수. 토큰이 없으면 에러를 throw (인증이 반드시 필요한 API)
 * - 'optional': JWT 있으면 포함, 없으면 미포함으로 요청 (비로그인 사용자도 호출 가능한 API)
 * - 'none'    : JWT를 포함하지 않음 (Public API, 로그인/회원가입 등)
 */
export type AuthMode = 'required' | 'optional' | 'none';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  auth?: AuthMode; // 기본: 'required'
  parseJson?: boolean; // 기본: true
  body?: string | FormData | Record<string, any>;
}

const toUrl = (path: string) =>
  path.startsWith('http')
    ? path
    : `${USERS_API_URL}${path.startsWith('/') ? '' : '/'}${path}`;

async function handleResponse<T>(
  res: Response,
  hadToken: boolean,
): Promise<ApiResponse<T>> {
  const text = await res.text();
  let json: ApiResponse<T> | null = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw {
      timestamp: new Date().toISOString(),
      status: res.status,
      path: res.url,
      code: 'NON_JSON_RESPONSE',
      message: text || res.statusText,
    };
  }

  if (!res.ok) {
    const error = json ?? {
      timestamp: new Date().toISOString(),
      status: res.status,
      path: res.url,
      code: 'UNKNOWN_ERROR',
      message: 'Unknown error',
    };

    // 401 에러 + 토큰이 있었던 경우 → 토큰 만료 가능성
    // (토큰 갱신은 TokenManager.getValidAccessToken()에서 선제적으로 처리하므로,
    //  여기 도달했다면 Refresh Token까지 만료된 상태일 가능성이 높음)
    if (res.status === 401 && hadToken) {
      console.log('[http] 401 에러 - 토큰이 더 이상 유효하지 않음');
      TokenManager.logout();
    }

    // 4xx 클라이언트 에러는 재시도해도 소용없으므로 React Query 재시도 스킵 플래그
    if (res.status >= 400 && res.status < 500) {
      (error as any).skipRetry = true;
    }

    throw error;
  }

  return json as ApiResponse<T>;
}

/**
 * 인증 모드에 따라 Authorization 헤더를 설정합니다.
 * - 'required': 토큰이 만료 임박이면 자동 갱신하고, 토큰이 없으면 에러 throw
 * - 'optional': 토큰이 있으면 갱신 후 포함, 없으면 미포함
 * - 'none': 헤더에 토큰을 포함하지 않음
 *
 * @returns [hadToken, accessToken | null]
 */
async function resolveAuth(
  authMode: AuthMode,
): Promise<[boolean, string | null]> {
  if (authMode === 'none') {
    return [false, null];
  }

  // getValidAccessToken은 만료 임박(1분 미만) 시 자동 갱신을 시도합니다
  const accessToken = await TokenManager.getValidAccessToken();

  if (!accessToken) {
    if (authMode === 'required') {
      throw {
        timestamp: new Date().toISOString(),
        status: 401,
        path: '',
        code: 'AUTH_REQUIRED',
        message: '인증이 필요한 API입니다. 로그인 후 다시 시도해주세요.',
        skipRetry: true,
      };
    }
    // optional: 토큰 없이 진행
    return [false, null];
  }

  return [true, accessToken];
}

export async function http<T>(
  path: string,
  method: HttpMethod = 'GET',
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const {
    auth = 'required',
    parseJson = true,
    headers,
    body,
    ...rest
  } = options;

  const initHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(body instanceof FormData
      ? {} // FormData는 Content-Type 자동 설정
      : { 'Content-Type': 'application/json' }),
    ...((headers as Record<string, string>) || {}),
  };

  // 인증 처리
  const [hadToken, accessToken] = await resolveAuth(auth);
  if (accessToken) {
    initHeaders.Authorization = `Bearer ${accessToken}`;
  }

  // body 직렬화
  let serializedBody: string | FormData | undefined;
  if (body instanceof FormData) {
    serializedBody = body;
  } else if (typeof body === 'object' && body !== null) {
    serializedBody = JSON.stringify(body);
  } else if (typeof body === 'string') {
    serializedBody = body;
  }

  const res = await fetch(toUrl(path), {
    method,
    headers: initHeaders,
    body: serializedBody,
    ...rest,
  });

  return parseJson ? handleResponse<T>(res, hadToken) : (res as any);
}

// 파일 업로드용 HTTP 함수
export const httpUpload = async <T>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH',
  formData: FormData,
  options: {
    auth?: AuthMode;
    headers?: Record<string, string>;
  } = {},
): Promise<ApiResponse<T>> => {
  const { auth = 'required', headers = {} } = options;

  const initHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  // 인증 처리
  const [hadToken, accessToken] = await resolveAuth(auth);
  if (accessToken) {
    initHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(toUrl(endpoint), {
    method,
    headers: initHeaders,
    body: formData,
  });

  return handleResponse<T>(res, hadToken);
};
