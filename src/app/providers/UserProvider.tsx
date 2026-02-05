import React, { useEffect } from 'react';
import * as RNLocalize from 'react-native-localize';
import { useUserStore } from '../../shared/store/userStore';

interface UserProviderProps {
  children: React.ReactNode;
}

/**
 * 앱 전역에서 유저 상태 초기화를 담당하는 프로바이더입니다.
 * 앱 실행 시 저장된 유저 정보를 확인하고 스토어를 초기화합니다.
 */
export const UserProvider = ({ children }: UserProviderProps) => {
  const { isInitialized, isLoading, setDeviceInfo } = useUserStore();
  
  // Zustand persist의 onRehydrateStorage에서 초기화 완료 처리를 하지만,
  // 명시적인 초기화 로직이 더 필요하다면 여기에 추가할 수 있습니다.
  
  // 예: 토큰 유효성 검사 등
  useEffect(() => {
    // 1. 기기 타임존 및 언어 설정 감지
    const timezone = RNLocalize.getTimeZone();
    const locales = RNLocalize.getLocales();
    const language = locales[0]?.languageCode || 'ko'; // 기본값 ko

    setDeviceInfo({ timezone, language });
    
    // 여기에 앱 시작 시 필요한 유저 관련 비동기 초기화 로직을 넣을 수 있습니다.
    // 현재는 secureStorage 복구가 완료되면 isInitialized가 true로 변합니다.
  }, []);

  // 필요한 경우 로딩 화면을 여기서 처리할 수도 있습니다.
  // if (!isInitialized || isLoading) { return <Splash />; }

  return <>{children}</>;
};
