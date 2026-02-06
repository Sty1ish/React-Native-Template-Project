import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  SharedValue, 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  useAnimatedReaction 
} from 'react-native-reanimated';

interface CollapsibleFooterProps {
  /** 외부 스크롤 뷰의 Y축 오프셋 (Animated.ScrollView의 onScroll과 연결된 값) */
  scrollY: SharedValue<number>;
  style?: any;
  onPressTab?: (index: number) => void;
}

/**
 * 스크롤 방향에 따라 자동으로 숨겨지거나 나타나는 푸터입니다.
 * - 아래로 스크롤: 숨김 (화면 아래로 이동)
 * - 위로 스크롤: 나타남
 * 
 * **필수 요구사항**:
 * - 이 푸터와 함께 사용하는 스크롤 컴포넌트는 반드시 `Animated` 버전이어야 합니다.
 *   (예: `Animated.FlatList`, `Animated.ScrollView`, `Animated.SectionList`)
 */
export const CollapsibleFooter = ({ 
  scrollY,
  style,
  onPressTab
}: CollapsibleFooterProps) => {
  const insets = useSafeAreaInsets();
  const FOOTER_HEIGHT = 60 + insets.bottom; // SafeArea 포함 전체 높이

  // 푸터의 Y축 위치 제어값 (0: 보임, FOOTER_HEIGHT: 숨김)
  const translateY = useSharedValue(0);

  useAnimatedReaction(
    () => scrollY.value,
    (current, previous) => {
      if (previous === null) return;
      const diff = current - previous;
      
      // 1. 스크롤을 아래로 내림 (diff > 0) && 어느정도 스크롤 됨 -> 숨김 (아래로 이동)
      if (diff > 0 && current > 50) {
        if (translateY.value !== FOOTER_HEIGHT) {
          translateY.value = withTiming(FOOTER_HEIGHT, { duration: 300 });
        }
      } 
      // 2. 스크롤을 위로 올림 (diff < 0) || 바닥에서 조금 올라옴 -> 보임 (0 위치로 복귀)
      else if (diff < -5) {
        if (translateY.value !== 0) {
          translateY.value = withTiming(0, { duration: 300 });
        }
      }
    },
    [FOOTER_HEIGHT] // dependency
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[
      styles.container, 
      { 
        paddingBottom: insets.bottom, 
        height: FOOTER_HEIGHT,
      },
      animatedStyle,
      style
    ]}>
        <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.tab} onPress={() => onPressTab?.(0)}>
                <Text style={styles.icon}>🏠</Text>
                <Text style={styles.label}>홈</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => onPressTab?.(1)}>
                <Text style={styles.icon}>🔍</Text>
                <Text style={styles.label}>검색</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => onPressTab?.(2)}>
                <Text style={styles.icon}>⚙️</Text>
                <Text style={styles.label}>설정</Text>
            </TouchableOpacity>
        </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    zIndex: 100, // 컨텐츠보다 위에 떠야 함
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: '#333',
  }
});
