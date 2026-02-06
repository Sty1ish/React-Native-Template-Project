import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile } from '../controller/userController';
import { userKeys } from '../queryKey/userKeys';
import { UserProfile } from '../dto/userProfileDto';
import { ApiResponse } from '../../../common/http';

/**
 * 사용자 프로필 수정 훅
 * 성공 시 사용자 프로필 쿼리를 무효화하여 최신 데이터를 다시 가져옵니다.
 */
export const useUpdateUserProfile = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<UserProfile>, Error, Partial<UserProfile>>({
    mutationFn: data => updateUserProfile(userId, data),
    onSuccess: () => {
      // 수정 성공 시, 해당 유저의 프로필 쿼리 캐시를 무효화 -> 자동 재조회 트리거
      queryClient.invalidateQueries({
        queryKey: userKeys.profile(userId),
      });
    },
  });
};
