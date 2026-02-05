import React from 'react';
import { StyleSheet, Button } from 'react-native';
import { 
    BottomSheetView, 
    BottomSheetTextInput, 
    BottomSheetScrollView 
} from '../../../widget/bottom-sheet';
import { BaseText } from '../../../shared/ui/BaseText';

export const LoginBottomSheet = () => {
  return (
    <BottomSheetView style={styles.container}>
      <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
        <BaseText fontSize={20} font="NotoSans-Bold" style={styles.title}>
          로그인
        </BaseText>
        
        <BaseText color="#666" style={styles.subtitle}>
          서비스 이용을 위해 로그인해주세요.
        </BaseText>

        <BottomSheetView style={styles.formArea}>
            <BottomSheetTextInput 
                placeholder="이메일"
                style={styles.input}
                placeholderTextColor="#999"
            />
            <BottomSheetTextInput 
                placeholder="비밀번호"
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#999"
            />
        </BottomSheetView>

        <BottomSheetView style={styles.buttonArea}>
            {/* 실제로는 디자인된 버튼 컴포넌트를 사용하겠지만, 지금은 RN 기본 버튼 사용 */}
            <Button title="로그인 하기" onPress={() => console.log('로그인 클릭')} />
        </BottomSheetView>

      </BottomSheetScrollView>
    </BottomSheetView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 30,
  },
  formArea: {
    gap: 12,
    marginBottom: 20,
  },
  input: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#000',
  },
  buttonArea: {
    marginTop: 10,
  }
});
