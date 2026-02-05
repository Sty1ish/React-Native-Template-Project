import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NewAppScreen } from '@react-native/new-app-screen';

export const MainPage = () => {
    // HOC(withSafeArea) 적용으로 인해 insets 관련 로직 삭제됨

    return (
        <View style={styles.container}>
            {/* NewAppScreen은 내부적으로 insets를 필요로 하지만, 
                여기서는 보여주기용이므로 임시로 빈 객체 전달하거나 
                이전 방식과 달라짐을 인지해야 함. 
                실제 프로젝트에서는 insets 없이 순수 컨텐츠만 오면 됨. 
            */}
            <NewAppScreen
                templateFileName="App.tsx" 
                // 이제 MainPage 자체가 SafeArea 안쪽으로 들어와서 그려지므로
                // 상단 패딩이 이미 적용된 상태임. 0으로 줘도 무방.
                safeAreaInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
