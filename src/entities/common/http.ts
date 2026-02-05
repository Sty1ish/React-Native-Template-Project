import { useUserStore } from '../../shared/store/userStore';

// TODO: 환경 변수 또는 설정 파일에서 관리 필요
export const USERS_API_URL = 'https://api.your-domain.com'; 

export interface ApiResponse<T> {
    code: string;
    data: T;
    message?: string;
    timestamp?: string;
    status?: number;
    path?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
    auth?: boolean;                 // 기본 true
    parseJson?: boolean;            // 기본 true
    // body는 string | FormData 허용
}

const toUrl = (path: string) =>
    path.startsWith('http') ? path : `${USERS_API_URL}${path.startsWith('/') ? '' : '/'}${path}`;

async function handleResponse<T>(res: Response, hadToken: boolean): Promise<ApiResponse<T>> {
    const text = await res.text();
    let json: ApiResponse<T> | null = null;
    try {
        json = text ? JSON.parse(text) : null;
    } catch {
        // 서버가 JSON이 아닐 경우(이례적) 최소한의 형태로 래핑
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

        // TODO: 401 에러 및 토큰 갱신 처리는 추후 TokenManager/Interceptors 도입 시 구현 필요
        if (res.status === 401 && !hadToken) {
            console.log('[http] 401 에러 감지 - 비로그인 상태에서 인증 필요 API 호출');
            // globalApiErrorEmitter.emit(...) 
        }

        // 4xx 클라이언트 에러는 재시도해도 소용없으므로 재시도 안함 플래그 (React Query용)
        if (res.status >= 400 && res.status < 500) {
            (error as any).skipRetry = true;
        }

        throw error;
    }

    return json as ApiResponse<T>;
}

export async function http<T>(
    path: string,
    method: HttpMethod = 'GET',
    options: RequestOptions = {}
): Promise<ApiResponse<T>> {
    const { auth = true, parseJson = true, headers, body, ...rest } = options;

    const initHeaders: Record<string, string> = {
        Accept: 'application/json',
        ...(body instanceof FormData
            ? {} // FormData는 Content-Type 자동 설정
            : { 'Content-Type': 'application/json' }),
        ...(headers as Record<string, string> || {}),
    };

    let hadToken = false;

    if (auth) {
        // TODO: TokenManager 도입 후 getValidAccessToken()으로 교체 필요
        const tokens = useUserStore.getState().tokens;
        const accessToken = tokens?.accessToken; // AuthTokens 인터페이스가 유연하므로 accessToken 필드 사용 가정
        
        if (accessToken) {
            initHeaders.Authorization = `Bearer ${accessToken}`;
            hadToken = true;
            console.log('[http] JWT 포함하여 요청:', path);
        } else {
            console.log('[http] JWT 없음 - 비로그인 상태로 요청:', { path });
        }
    }

    const res = await fetch(toUrl(path), {
        method,
        headers: initHeaders,
        body: body instanceof FormData ? body : (typeof body === 'object' ? JSON.stringify(body) : body),
        ...rest,
    });

    return parseJson ? handleResponse<T>(res, hadToken) : (res as any);
}

// 파일 업로드용 HTTP 함수
export const httpUpload = async <T>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH',
  formData: FormData,
  options: { auth?: boolean; headers?: Record<string, string> } = {}
): Promise<ApiResponse<T>> => {
  const { auth = true, headers = {} } = options;

  const initHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  let hadToken = false;

  // JWT 토큰 추가
  if (auth) {
    const tokens = useUserStore.getState().tokens;
    const accessToken = tokens?.accessToken;

    if (accessToken) {
      initHeaders.Authorization = `Bearer ${accessToken}`;
      hadToken = true;
    }
  }

  const res = await fetch(toUrl(endpoint), {
    method,
    headers: initHeaders,
    body: formData,
  });

  return handleResponse<T>(res, hadToken);
};
