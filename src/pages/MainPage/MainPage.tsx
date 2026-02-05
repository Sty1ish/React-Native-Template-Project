import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NewAppScreen } from '@react-native/new-app-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MainPage = () => {
    const safeAreaInsets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <NewAppScreen
                templateFileName="App.tsx"
                safeAreaInsets={safeAreaInsets}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
