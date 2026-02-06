// src/app/routers/RootStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { MainPage } from '../../pages/MainPage';
import { SubPage } from '../../pages/SubPage';
import { withSafeArea } from '../../shared/lib/withSafeArea';

export type RootStackParamList = {
  MainPage: undefined;
  SubPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// HOC가 적용된 컴포넌트들
// MainPage에서 자체 헤더(FixedHeader), 푸터(FixedFooter)를 사용하므로 둘 다 false
const SafeMainPage = withSafeArea(MainPage, { top: false, bottom: false });
// SubPage에서는 CollapsibleHeader, CollapsibleFooter를 사용하므로 둘 다 false
const SafeSubPage = withSafeArea(SubPage, { top: false, bottom: false });
// 만약 헤더나 푸터가 존재하지 않는 페이지라면, withSafeArea의 옵션을 true로 설정하여 안전 패딩을 설정해야합니다

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainPage"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainPage" component={SafeMainPage} />
        <Stack.Screen name="SubPage" component={SafeSubPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
