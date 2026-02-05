// src/app/routers/RootStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { MainPage } from '../../pages/MainPage';

export type RootStackParamList = {
  MainPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="MainPage"
        screenOptions={{
             headerShown: false
        }}
        >
        <Stack.Screen name="MainPage" component={MainPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
