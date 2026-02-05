import { http } from '../../../common/http';
import { UserProfile } from '../dto/userProfileDto';

/**
 * 사용자 프로필 조회
 * @param userId 사용자 ID
 */
export const getUserProfile = (userId: number) => 
    http<UserProfile>(`/users/${userId}/profile`, 'GET');

/**
 * 사용자 프로필 수정
 * @param userId 사용자 ID
 * @param data 수정할 프로필 데이터
 */
export const updateUserProfile = (userId: number, data: Partial<UserProfile>) =>
    http<UserProfile>(`/users/${userId}/profile`, 'PUT', { body: JSON.stringify(data) });

