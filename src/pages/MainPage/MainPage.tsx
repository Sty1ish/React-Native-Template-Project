import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { BaseText } from '../../shared/ui/BaseText';
import { showLoginModal } from '../../features/auth';

export const MainPage = () => {
    // HOC(withSafeArea) 적용으로 인해 insets 관련 로직 삭제됨

    return (
        <View style={styles.container}>
            <BaseText fontSize={24} font="NotoSans-Bold" style={styles.title}>
                TripWithU
            </BaseText>
            
            <View style={styles.content}>
                <BaseText color="#666" style={{ marginBottom: 20 }}>
                    메인 페이지입니다.
                </BaseText>

                <Button 
                    title="로그인 하기" 
                    onPress={showLoginModal} // 함수 직접 연결
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        marginTop: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
