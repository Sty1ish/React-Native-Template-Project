import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useAnimatedReaction,
} from 'react-native-reanimated';

interface CollapsibleHeaderProps {
  /** 외부 스크롤 뷰의 Y축 오프셋 (Animated.ScrollView의 onScroll과 연결된 값) */
  scrollY: SharedValue<number>;
  title?: string | ReactNode;
  leftIcon?: ReactNode | boolean;
  rightIcon?: ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  style?: any;
}

/**
 * 스크롤 방향에 따라 자동으로 숨겨지거나 나타나는 헤더입니다.
 * - 아래로 스크롤: 숨김
 * - 위로 스크롤: 나타남
 * - 최상단: 항상 나타남
 *
 * **주의**: 이 컴포넌트는 `absolute` 포지션을 사용하므로,
 * 사용하는 페이지의 ScrollView에 `contentContainerStyle={{ paddingTop: 헤더높이 }}`를 주어야 컨텐츠가 가리지 않습니다.
 * export된 `getHeaderHeight()` 유틸리티를 사용하세요.
 *
 * **필수 요구사항**:
 * - 이 헤더와 함께 사용하는 스크롤 컴포넌트는 반드시 `Animated` 버전이어야 합니다.
 *   (예: `Animated.FlatList`, `Animated.ScrollView`, `Animated.SectionList`)
 * - 일반 `FlatList`나 `ScrollView`는 `scrollY` (SharedValue)와 연결할 수 없으므로 동작하지 않습니다.
 */
export const CollapsibleHeader = ({
  scrollY,
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
}: CollapsibleHeaderProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const HEADER_HEIGHT = 50 + insets.top; // SafeArea 포함 전체 높이

  // 헤더의 Y축 위치 제어값 (0: 보임, -HEADER_HEIGHT: 숨김)
  const translateY = useSharedValue(0);

  useAnimatedReaction(
    () => scrollY.value,
    (current, previous) => {
      if (previous === null) return;
      const diff = current - previous;

      // 1. 스크롤을 아래로 내림 (diff > 0) && 헤더 높이만큼 내려왔을 때 -> 숨김
      if (diff > 0 && current > HEADER_HEIGHT) {
        // 이미 숨겨져 있지 않다면 숨김 처리
        if (translateY.value !== -HEADER_HEIGHT) {
          translateY.value = withTiming(-HEADER_HEIGHT, { duration: 300 });
        }
      }
      // 2. 스크롤을 위로 올림 (diff < 0) || 최상단 부근 -> 보임
      else if (diff < -5 || current < 5) {
        if (translateY.value !== 0) {
          translateY.value = withTiming(0, { duration: 300 });
        }
      }
    },
    [HEADER_HEIGHT], // dependency
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleGoBack = () => {
    if (onLeftPress) onLeftPress();
    else if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          height: HEADER_HEIGHT,
        },
        animatedStyle,
      ]}
    >
      {/* Left */}
      <View style={styles.left}>
        {leftIcon === false ? null : (
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.btn}
            activeOpacity={0.7}
          >
            {leftIcon || <Text style={styles.defaultIcon}>⬅️</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* Center */}
      <View style={styles.center}>
        {typeof title === 'string' ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          title
        )}
      </View>

      {/* Right */}
      <View style={styles.right}>
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.btn}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// 유틸리티: 헤더 높이 계산용 (일단은 hooks가 아니라서 insets을 못 가져오므로, 대략값이나 상수를 써야함.
// 정확한 값을 위해선 Hook으로 제공하거나, 페이지에서 useSafeAreaInsets() + 50을 해야함)
// 여기서는 편의를 위해 페이지에서 계산하도록 가이드함.

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', // 겹쳐지므로 배경색 필수
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 100,
    elevation: 3, // 안드로이드 그림자
    shadowColor: '#000', // iOS 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  left: { width: 50, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  right: { width: 50, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  btn: { padding: 10 },
  defaultIcon: { fontSize: 20 },
});
