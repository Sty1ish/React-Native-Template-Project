import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { 
    BottomSheetView, 
    BottomSheetTextInput, 
} from '../../../widget/bottom-sheet';
import { BaseText } from '../../../shared/ui/BaseText';
import { AutoLayout } from '../../../shared/ui/AutoLayout';

export const LoginBottomSheet = () => {
  return (
    <BottomSheetView style={styles.contentContainer}>
      <AutoLayout axis="vertical" px={20} pb={40}>
        <AutoLayout axis="vertical"  mt={20} mb={30} gap={8}>
            <BaseText fontSize={20} font="NotoSans-Bold">
            로그인
            </BaseText>
            
            <BaseText color="#666">
            서비스 이용을 위해 로그인해주세요.
            </BaseText>
        </AutoLayout>

        <AutoLayout axis="vertical" w='fill' gap={12} mb={20}>
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
        </AutoLayout>

        <Pressable onPress={() => console.log('로그인 클릭')}>
            <AutoLayout w="fill" height={52} bg="#222" radius={8} align="center" justify="center">
                <BaseText color="#fff" fontSize={16} font="NotoSans-Bold">로그인 하기</BaseText>
            </AutoLayout>
        </Pressable>

      </AutoLayout>
    </BottomSheetView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    // BottomSheetView는 내부 컨텐츠 크기에 맞춰 높이가 결정됩니다.
  },
  input: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#000',
  },
});
