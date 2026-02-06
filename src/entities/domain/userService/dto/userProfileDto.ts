export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type UserStatusType = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface UserProfile {
  userId: number;
  displayName: string;
  avatarUrl?: string;
  email: string;
  introduction?: string;
  gender?: Gender;
  birthYear?: number;
  occupation?: string;
  followerCount: number;
  createdAt: string;
  updatedAt: string;
  statusType: UserStatusType;
}
