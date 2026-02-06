import React from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseText } from '../../shared/ui/BaseText';
import { showLoginModal } from '../../features/auth';
import { FixedHeader } from '../../widget/header';
import { FixedFooter } from '../../widget/footer';

export const MainPage = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* Case A: 고정 헤더 */}
      <FixedHeader
        leftIcon={false} // 뒤로가기 숨김
        title={
          <BaseText fontSize={20} font="NotoSans-Bold">
            TripWithU
          </BaseText>
        }
        rightIcon={<Text style={{ fontSize: 20 }}>🔍</Text>}
        onRightPress={() => console.log('Search')}
      />

      <View style={styles.content}>
        <BaseText color="#666" style={{ marginBottom: 20 }}>
          메인 페이지입니다.
        </BaseText>

        <View style={styles.buttonGroup}>
          <Button title="로그인 하기" onPress={showLoginModal} />
          <View style={{ height: 20 }} />
          <Button
            title="서브 페이지로 이동 (스크롤 헤더)"
            onPress={() => navigation.navigate('SubPage')}
          />
        </View>
      </View>

      {/* Case A: 고정 푸터 */}
      <FixedFooter onPressTab={index => console.log(`Tab ${index} pressed`)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonGroup: {
    width: '100%',
    maxWidth: 300,
  },
});
