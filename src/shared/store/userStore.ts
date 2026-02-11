import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import * as Keychain from 'react-native-keychain';

// --- Types ---

// 유저 정보의 구체적인 형태(필드)가 정해지지 않았으므로,
// 어떤 데이터든 담을 수 있는 유연한 객체 구조로 정의합니다.
export interface User {
  [key: string]: any;
}

// 기기 환경 정보 타입 정의
export interface DeviceInfo {
  timezone: string;
  language: string;
}

// JWT 인증 토큰 인터페이스
// AccessToken은 TokenManager(메모리)에서 관리되므로 Store에는 포함하지 않음.
// RefreshToken만 Keychain을 통해 영속 저장됩니다.
export interface AuthTokens {
  refreshToken: string;
  [key: string]: any; // 확장 필드 허용
}

interface UserStoreState {
  user: User | null;
  refreshToken: string | null; // Keychain persist 대상 (AccessToken은 TokenManager 메모리에서 관리)
  device: DeviceInfo;
  isInitialized: boolean;
  isLoading: boolean;
}

interface UserStoreActions {
  setUserInfo: (user: User) => void;
  setRefreshToken: (token: string) => void;
  setDeviceInfo: (info: Partial<DeviceInfo>) => void;
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
    set => ({
      user: null,
      refreshToken: null,
      device: {
        timezone: 'Asia/Seoul',
        language: 'ko',
      },
      isInitialized: false,
      isLoading: true,

      setUserInfo: user => set({ user }),
      setRefreshToken: token => set({ refreshToken: token }),
      setDeviceInfo: info =>
        set(state => ({
          device: { ...state.device, ...info },
        })),
      setInitialized: state => set({ isInitialized: state }),
      setLoading: state => set({ isLoading: state }),
      logout: () => {
        set(state => ({
          user: null,
          refreshToken: null,
          device: state.device,
          isInitialized: true,
          isLoading: false,
        }));
      },
    }),
    {
      name: SECURE_STORAGE_KEY,
      storage: createJSONStorage(() => secureStorage),
      // RefreshToken + User만 Keychain에 영속 저장
      // AccessToken은 TokenManager가 메모리에서 관리하므로 persist 대상 아님
      partialize: state => ({
        user: state.user,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          state.setInitialized(true);
          state.setLoading(false);
        }
      },
    },
  ),
);
