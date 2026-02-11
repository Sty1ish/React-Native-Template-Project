import { useMutation } from '@tanstack/react-query';
import { oauthLoginApi } from '../controller/authController';
import { OAuthLoginRequest, OAuthLoginResponse } from '../dto/authDto';
import { ApiResponse } from '../../../common/http';
import { TokenManager } from '../../../../app/services/TokenManager';

/**
 * OAuth 로그인 뮤테이션 훅
 *
 * Firebase 소셜 로그인(Google/Apple) 후 발급받은 ID Token을
 * 서버에 전달하여 우리 서버의 JWT를 발급받습니다.
 *
 * 플로우:
 * 1. 컴포넌트에서 Firebase 소셜 로그인 수행 (Google Sign-In / Apple Auth)
 * 2. Firebase ID Token 획득
 * 3. 이 훅의 mutate({ provider, idToken }) 호출
 * 4. 서버 API 호출 → JWT 발급 → TokenManager 자동 저장
 *
 * @example
 * const { mutate: oauthLogin, isPending } = useOAuthLogin();
 *
 * // Google 로그인 완료 후
 * const idToken = await firebaseUser.getIdToken();
 * oauthLogin(
 *   { provider: 'google', idToken },
 *   {
 *     onSuccess: () => navigation.navigate('Main'),
 *     onError: (error) => Alert.alert('로그인 실패', error.message),
 *   },
 * );
 */
export const useOAuthLogin = () => {
  return useMutation<ApiResponse<OAuthLoginResponse>, any, OAuthLoginRequest>({
    mutationFn: oauthLoginApi,
    onSuccess: response => {
      const { accessToken, refreshToken, tokenType } = response.data;
      TokenManager.login(accessToken, refreshToken, tokenType);
    },
  });
};
