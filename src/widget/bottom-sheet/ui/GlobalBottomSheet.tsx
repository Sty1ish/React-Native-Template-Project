import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Keyboard } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useBottomSheetStore } from '../model/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const GlobalBottomSheet = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { 
    isOpen, content, snapPoints, close,
    backdropOpacity, backdropPressBehavior
  } = useBottomSheetStore();
  const { bottom: bottomSafe } = useSafeAreaInsets();

  // 상태(isOpen) 변경에 따라 모달 제어
  useEffect(() => {
    if (isOpen) {
        // 키보드가 내려가는 동작이 필요할 수도 있음
        Keyboard.dismiss();
        bottomSheetRef.current?.present();
    } else {
        bottomSheetRef.current?.dismiss();
    }
  }, [isOpen]);

  // 바텀시트가 닫혔을 때 (제스처로 닫거나, 배경 눌러서 닫았을 때) 스토어 상태 동기화
  const handleDismiss = useCallback(() => {
    // 이미 닫혔는데 또 호출되는 경우 방지 (스토어 업데이트)
    close();
  }, [close]);

  // 배경(Backdrop) 설정 - 뒤에 흐리게 처리
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior={backdropPressBehavior} // Store 값 동적 적용
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={backdropOpacity}          // Store 값 동적 적용
      />
    ),
    [backdropOpacity, backdropPressBehavior] // 의존성 추가
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0} // 열렸을 때 첫번째 snapPoint 사용
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      enablePanDownToClose={true} // 드래그해서 닫기 가능
      keyboardBehavior="interactive" // 키보드 연동
      keyboardBlurBehavior="restore"
      containerStyle={styles.container}
    >
        {/* SafeArea 대응 및 컨텐츠 렌더링 */}
        {/* 
            BottomSheetModal 내부는 자동 SafeArea 처리가 안될 수 있으므로,
            필요에 따라 Padding을 주거나, Content 내부에서 처리하도록 합니다.
            여기서는 Content를 그대로 렌더링합니다.
        */}
        {content}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
    container: {
        // 모달 컨테이너 스타일 (필요시 추가)
    }
});
