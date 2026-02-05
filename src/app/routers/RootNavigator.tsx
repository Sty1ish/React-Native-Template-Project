// src/app/routers/RootStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { MainPage } from '../../pages/MainPage';
import { withSafeArea } from '../../shared/ui/withSafeArea';

export type RootStackParamList = {
  MainPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// HOC가 적용된 컴포넌트들
// 필요한 옵션이 있다면 두 번째 인자로 전달 (예: { backgroundColor: 'black', bottom: false })
const SafeMainPage = withSafeArea(MainPage);

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};
