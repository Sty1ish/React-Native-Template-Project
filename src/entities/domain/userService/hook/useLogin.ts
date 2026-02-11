import { useMutation } from '@tanstack/react-query';
import { loginApi } from '../controller/authController';
import { LoginRequest, LoginResponse } from '../dto/authDto';
import { ApiResponse } from '../../../common/http';
import { TokenManager } from '../../../../app/services/TokenManager';

/**
 * 로그인 뮤테이션 훅
 *
 * 로그인 성공 시 TokenManager를 통해 토큰을 자동 저장합니다.
 *
 * @example
 * const { mutate: login, isPending } = useLogin();
 *
 * login(
 *   { email: 'user@example.com', password: 'pass123' },
 *   {
 *     onSuccess: (data) => {
 *       // 로그인 성공 후 처리 (화면 이동 등)
 *       navigation.navigate('Main');
 *     },
 *     onError: (error) => {
 *       // 에러 처리
 *       Alert.alert('로그인 실패', error.message);
 *     },
 *   },
 * );
 */
export const useLogin = () => {
  return useMutation<ApiResponse<LoginResponse>, any, LoginRequest>({
    mutationFn: loginApi,
    onSuccess: response => {
      const { accessToken, refreshToken, tokenType } = response.data;
      TokenManager.login(accessToken, refreshToken, tokenType);
    },
  });
};
