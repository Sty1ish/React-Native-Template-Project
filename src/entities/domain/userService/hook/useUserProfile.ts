import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../controller/userController';
import { userKeys } from '../queryKey/userKeys';

/**
 * 사용자 프로필 조회 훅
 * @param userId 조회할 사용자 ID
 */
export const useUserProfile = (userId: number) => {
    return useQuery({
        queryKey: userKeys.profile(userId),
        queryFn: () => getUserProfile(userId),
        staleTime: 1000 * 30, // 30초
        gcTime: 1000 * 60 * 5, // 5분
        enabled: !!userId, // userId가 유효할 때만 실행
    });
};
