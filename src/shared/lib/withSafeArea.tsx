import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';

interface SafeAreaOptions {
  /** 상단 Safe Area 적용 여부 (기본값: true) */
  top?: boolean;
  /** 하단 Safe Area 적용 여부 (기본값: true) */
  bottom?: boolean;
  /** 배경색 (기본값: 'white') */
  backgroundColor?: string;
  /** 추가 스타일 */
  style?: ViewStyle;
}

/**
 * 컴포넌트를 Safe Area 처리가 된 View로 감싸주는 HOC입니다.
 * Page 컴포넌트 내부에서 반복적인 Safe Area 처리를 제거하기 위해 사용합니다.
 * 
 * @example
 * // Router 등록 시
 * <Stack.Screen name="Main" component={withSafeArea(MainPage)} />
 * 
 * // 옵션 지정 시
 * <Stack.Screen name="Detail" component={withSafeArea(DetailPage, { bottom: false, backgroundColor: '#f0f0f0' })} />
 */
export function withSafeArea<P extends object>(
  Component: React.ComponentType<P>,
  options: SafeAreaOptions = {}
) {
  return function WithSafeAreaWrapper(props: P) {
    const insets = useSafeAreaInsets();
    
    // 옵션 기본값 처리
    const {
      top = true,
      bottom = true,
      backgroundColor = '#ffffff', // 기본 흰색 배경
      style,
    } = options;

    const containerStyle: ViewStyle = {
      flex: 1,
      backgroundColor,
      paddingTop: top ? insets.top : 0,
      paddingBottom: bottom ? insets.bottom : 0,
      paddingLeft: insets.left, // 가로 모드 대응 (일반적으로 필요)
      paddingRight: insets.right, // 가로 모드 대응 (일반적으로 필요)
      ...style,
    };

    return (
      <View style={containerStyle}>
        <Component {...props} />
      </View>
    );
  };
}
