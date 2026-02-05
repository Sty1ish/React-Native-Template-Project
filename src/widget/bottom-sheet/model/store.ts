import { create } from 'zustand';
import React from 'react';

interface BottomSheetState {
  isOpen: boolean;
  content: React.ReactNode | null;
  /** snapPoints (예: ['25%', '50%']) - 기본값 ['50%'] */
  snapPoints: (string | number)[];
  
  // --- Backdrop Options ---
  /** 백드롭 투명도 (기본 0.5) */
  backdropOpacity: number;
  /** 백드롭 클릭 시 동작 (기본 'close') */
  backdropPressBehavior: 'none' | 'close' | 'collapse';

  /** 바텀시트 열기 */
  open: (
    content: React.ReactNode, 
    options?: { 
      snapPoints?: (string | number)[];
      backdropOpacity?: number;
      backdropPressBehavior?: 'none' | 'close' | 'collapse';
    }
  ) => void;
  /** 바텀시트 닫기 */
  close: () => void;
}

export const useBottomSheetStore = create<BottomSheetState>((set, get) => ({
  isOpen: false,
  content: null,
  snapPoints: ['50%'],
  backdropOpacity: 0.5,
  backdropPressBehavior: 'close',

  open: (content, options) => {
    // 이미 열려있다면 중복 실행 방지 (요구사항)
    if (get().isOpen) {
      console.warn('[GlobalBottomSheet] 이미 실행 중인 바텀시트가 있습니다. 먼저 닫아주세요.');
      return;
    }

    set({
      isOpen: true,
      content,
      snapPoints: options?.snapPoints ?? ['50%'],
      backdropOpacity: options?.backdropOpacity ?? 0.5,
      backdropPressBehavior: options?.backdropPressBehavior ?? 'close',
    });
  },

  close: () => {
    set({
      isOpen: false,
      content: null, 
      // 옵션들은 굳이 초기화 안해도 다음 open때 덮어씌워짐
    });
  },
}));
