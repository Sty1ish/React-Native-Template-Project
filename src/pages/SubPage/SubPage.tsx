import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  useAnimatedScrollHandler, 
  useSharedValue, 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CollapsibleHeader } from '../../widget/header';

export const SubPage = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 스크롤 값만 공유 (로직은 헤더 내부로 위임)
  const scrollY = useSharedValue(0);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 헤더 높으는 CollapsibleHeader 내부 로직과 맞춤 (50 + top)
  // safeAreaInset을 고려하여 패딩을 줍니다.
  const HEADER_HEIGHT_ESTIMATE = 50 + insets.top;

  return (
    <View style={styles.container}>
      {/* 
        Case B: 스크롤 시 사라졌다 나타나는 헤더
        - 애니메이션 로직, 높이 계산 등은 컴포넌트 내부로 숨겨짐
        - 외부에서는 scrollY 값만 전달하면 됨
      */}
      <CollapsibleHeader
        scrollY={scrollY}
        title="Sub Page (Auto Hide)"
        onLeftPress={() => navigation.goBack()}
        rightIcon={<Text style={{ fontSize: 20 }}>⚙️</Text>} 
        onRightPress={() => console.log('Settings')}
      />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
            paddingTop: HEADER_HEIGHT_ESTIMATE, // 헤더가 absolute이므로 여백 필요
            paddingBottom: insets.bottom + 20 
        }}
      >
        <Description />
        
        {Array.from({ length: 30 }).map((_, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardText}>Item {index + 1}</Text>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

const Description = () => (
    <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          이제 스크롤 로직이{'\n'}
          CollapsibleHeader 내부로 캡슐화되었습니다.
        </Text>
    </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  descriptionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  description: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  cardText: {
    fontSize: 16,
  }
});
