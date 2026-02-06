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
// MainPage에서 자체 헤더(FixedHeader)를 쓰므로 상단 Safe Area 처리는 헤더에게 위임합니다 (top: false)
const SafeMainPage = withSafeArea(MainPage, { top: false });
// SubPage는 내부에서 처리하므로 withSafeArea 옵션을 조정하거나, 그냥 둡니다.
// SubPage는 CollapsibleHeader가 Absolute로 떠있지만, 하단 Safe Area는 필요하므로 bottom: true, top: false로 설정
const SafeSubPage = withSafeArea(SubPage, { top: false });

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="MainPage"
        screenOptions={{
             headerShown: false
        }}
        >
        <Stack.Screen name="MainPage" component={SafeMainPage} />
        <Stack.Screen name="SubPage" component={SafeSubPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
