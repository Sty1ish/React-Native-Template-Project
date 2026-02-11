import { useCallback } from 'react';
import { TokenManager } from '../../../../app/services/TokenManager';

/**
 * 로그아웃 훅
 *
 * TokenManager를 통해 토큰 및 유저 정보를 초기화합니다.
 *
 * @example
 * const { logout } = useLogout();
 *
 * <Button onPress={logout} title="로그아웃" />
 */
export const useLogout = () => {
  const logout = useCallback(() => {
    TokenManager.logout();
  }, []);

  return { logout };
};
