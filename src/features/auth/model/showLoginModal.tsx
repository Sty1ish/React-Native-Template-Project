import React from 'react';
import { useBottomSheetStore } from '../../../widget/bottom-sheet';
import { LoginBottomSheet } from '../ui/LoginBottomSheet';

/**
 * 로그인 모달을 띄웁니다.
 * UI(버튼) 또는 로직 내임의의 위치에서 호출 가능합니다.
 */
export const showLoginModal = () => {
  const { open } = useBottomSheetStore.getState();
  
  open(<LoginBottomSheet />, {
    snapPoints: ['80%'], // 로그인 창 높이 80%로 설정
    enableDynamicSizing: false,
    backdropPressBehavior: 'close',
  });
};
