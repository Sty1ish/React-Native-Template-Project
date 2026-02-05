/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { UserProvider } from './src/app/providers/UserProvider';
import { RootNavigator } from './src/app/routers/RootNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <UserProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <RootNavigator />
      </UserProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
