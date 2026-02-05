import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import * as Keychain from 'react-native-keychain';

// --- Types ---

// 유저 정보의 구체적인 형태(필드)가 정해지지 않았으므로,
// 어떤 데이터든 담을 수 있는 유연한 객체 구조로 정의합니다.
export interface User {
  [key: string]: any;
}

// 토큰 정보 또한, JWT여부나 필드명이 확정되지 않았으므로
// 확장성을 위해 모든 키/값을 허용합니다.
export interface AuthTokens {
  [key: string]: any;
}

interface UserStoreState {
  user: User | null;
  tokens: AuthTokens | null;
  isInitialized: boolean;
  isLoading: boolean;
}

interface UserStoreActions {
  setUserInfo: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setInitialized: (state: boolean) => void;
  setLoading: (state: boolean) => void;
  logout: () => void;
}

export type UserStore = UserStoreState & UserStoreActions;

// --- Secure Storage Implementation ---

const SECURE_STORAGE_KEY = 'app_auth_storage';

const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const result = await Keychain.getGenericPassword({ service: name });
      if (result) {
        return result.password;
      }
      return null;
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await Keychain.setGenericPassword('auth_data', value, {
        service: name,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await Keychain.resetGenericPassword({ service: name });
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
    }
  },
};

// --- Store ---

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isInitialized: false,
      isLoading: true, // 초기 로딩 상태

      setUserInfo: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
      setInitialized: (state) => set({ isInitialized: state }),
      setLoading: (state) => set({ isLoading: state }),
      logout: () => {
        set({ user: null, tokens: null, isInitialized: true, isLoading: false });
      },
    }),
    {
      name: SECURE_STORAGE_KEY, // 스토리지 Key
      storage: createJSONStorage(() => secureStorage), // 커스텀 보안 스토리지 적용
      partialize: (state) => ({ user: state.user, tokens: state.tokens }), // user와 tokens만 영구 저장
      onRehydrateStorage: () => (state) => {
        // Hydration(복구)이 끝난 후 실행
        if (state) {
          state.setInitialized(true);
          state.setLoading(false);
        }
      },
    }
  )
);
