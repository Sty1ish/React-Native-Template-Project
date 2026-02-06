import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FixedFooterProps {
  style?: ViewStyle;
  backgroundColor?: string;
  onPressTab?: (index: number) => void;
}

/**
 * 화면 하단에 고정되어 있는 기본 푸터입니다.
 * absolute 포지션이 아니므로 레이아웃 흐름을 차지합니다.
 */
export const FixedFooter = ({
  style,
  backgroundColor = '#ffffff',
  onPressTab,
}: FixedFooterProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
          backgroundColor: backgroundColor,
        },
        style,
      ]}
    >
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tab} onPress={() => onPressTab?.(0)}>
          <Text style={styles.icon}>🏠</Text>
          <Text style={styles.label}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => onPressTab?.(1)}>
          <Text style={styles.icon}>❤️</Text>
          <Text style={styles.label}>찜</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => onPressTab?.(2)}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.label}>마이</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    zIndex: 100,
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
  },
});
