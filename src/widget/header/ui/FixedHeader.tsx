import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FixedHeaderProps {
  title?: string | ReactNode;
  leftIcon?: ReactNode | boolean;
  rightIcon?: ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  style?: ViewStyle;
  /** 헤더 배경색 (기본값: white) */
  backgroundColor?: string;
  /** 하단 보더 표시 여부 (기본값: true) */
  hideBorder?: boolean;
}

/**
 * 스크롤과 무관하게 상단에 고정되어 있는 기본 헤더입니다.
 * absolute 포지션이 아니므로 레이아웃 흐름을 차지합니다.
 */
export const FixedHeader = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  style,
  backgroundColor = '#ffffff',
  hideBorder = false,
}: FixedHeaderProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleGoBack = () => {
    if (onLeftPress) onLeftPress();
    else if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          height: 50 + insets.top,
          backgroundColor: backgroundColor,
          borderBottomWidth: hideBorder ? 0 : 1,
          borderBottomColor: '#eee',
        },
        style,
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    zIndex: 100,
  },
  left: { width: 50, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  right: { width: 50, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  btn: { padding: 10 },
  defaultIcon: { fontSize: 20 },
});
