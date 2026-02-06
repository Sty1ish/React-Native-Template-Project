export const userKeys = {
  all: ['userService'] as const,
  profiles: () => [...userKeys.all, 'profiles'] as const,
  profile: (userId: number) => [...userKeys.profiles(), userId] as const,
};
