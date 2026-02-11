import React, { useState } from 'react';
import { StyleSheet, Pressable, Alert, Platform } from 'react-native';
import {
  BottomSheetView,
  BottomSheetTextInput,
} from '../../../widget/bottom-sheet';
import { BaseText } from '../../../shared/ui/BaseText';
import { AutoLayout } from '../../../shared/ui/AutoLayout';
import { useLogin } from '../../../entities/domain/userService/hook/useLogin';
import { useOAuthLogin } from '../../../entities/domain/userService/hook/useOAuthLogin';
import { useBottomSheetStore } from '../../../widget/bottom-sheet';

// Firebase + 소셜 로그인 (지연 import로 미설정 시에도 안전)
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const LoginBottomSheet = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: oauthLogin, isPending: isOAuthPending } = useOAuthLogin();
  const { close } = useBottomSheetStore();

  const isPending = isLoginPending || isOAuthPending;

  // ─── 이메일 로그인 ────────────────────────────

  const handleEmailLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    login(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          close();
        },
        onError: error => {
          Alert.alert('로그인 실패', error?.message || '다시 시도해주세요.');
        },
      },
    );
  };

  // ─── Google 로그인 → 서버 JWT 발급 ───────────

  const handleGoogleLogin = async () => {
    try {
      // 1. Google Sign-In
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('Google ID Token을 획득하지 못했습니다.');
      }

      // 2. Firebase에 Google Credential로 로그인
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const firebaseResult = await auth().signInWithCredential(googleCredential);

      // 3. Firebase ID Token 획득
      const firebaseIdToken = await firebaseResult.user.getIdToken();

      // 4. 서버에 Firebase ID Token 전달 → 우리 JWT 발급
      oauthLogin(
        { provider: 'google', idToken: firebaseIdToken },
        {
          onSuccess: () => {
            close();
          },
          onError: error => {
            Alert.alert('로그인 실패', error?.message || '다시 시도해주세요.');
          },
        },
      );
    } catch (error: any) {
      console.error('[LoginBottomSheet] Google 로그인 에러:', error);
      Alert.alert('Google 로그인 실패', error?.message || '다시 시도해주세요.');
    }
  };

  // ─── Apple 로그인 → 서버 JWT 발급 ────────────

  const handleAppleLogin = async () => {
    try {
      const { appleAuth } = await import(
        '@invertase/react-native-apple-authentication'
      );

      // 1. Apple 인증 요청
      const appleAuthResult = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      if (!appleAuthResult.identityToken) {
        throw new Error('Apple Identity Token을 획득하지 못했습니다.');
      }

      // 2. Firebase에 Apple Credential로 로그인
      const { identityToken, nonce } = appleAuthResult;
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );
      const firebaseResult = await auth().signInWithCredential(appleCredential);

      // 3. Firebase ID Token 획득
      const firebaseIdToken = await firebaseResult.user.getIdToken();

      // 4. 서버에 Firebase ID Token 전달 → 우리 JWT 발급
      oauthLogin(
        { provider: 'apple', idToken: firebaseIdToken },
        {
          onSuccess: () => {
            close();
          },
          onError: error => {
            Alert.alert('로그인 실패', error?.message || '다시 시도해주세요.');
          },
        },
      );
    } catch (error: any) {
      console.error('[LoginBottomSheet] Apple 로그인 에러:', error);
      Alert.alert('Apple 로그인 실패', error?.message || '다시 시도해주세요.');
    }
  };

  return (
    <BottomSheetView style={styles.contentContainer}>
      <AutoLayout axis="vertical" px={20} pb={40}>
        <AutoLayout axis="vertical" mt={20} mb={30} gap={8}>
          <BaseText fontSize={20} font="NotoSans-Bold">
            로그인
          </BaseText>

          <BaseText color="#666">서비스 이용을 위해 로그인해주세요.</BaseText>
        </AutoLayout>

        {/* 이메일 로그인 */}
        <AutoLayout axis="vertical" w="fill" gap={12} mb={20}>
          <BottomSheetTextInput
            placeholder="이메일"
            style={styles.input}
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isPending}
          />
          <BottomSheetTextInput
            placeholder="비밀번호"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            editable={!isPending}
          />
        </AutoLayout>

        <Pressable onPress={handleEmailLogin} disabled={isPending}>
          <AutoLayout
            w="fill"
            height={52}
            bg={isPending ? '#999' : '#222'}
            radius={8}
            align="center"
            justify="center"
          >
            <BaseText color="#fff" fontSize={16} font="NotoSans-Bold">
              {isPending ? '로그인 중...' : '로그인 하기'}
            </BaseText>
          </AutoLayout>
        </Pressable>

        {/* 소셜 로그인 구분선 */}
        <AutoLayout axis="horizontal" w="fill" align="center" mt={24} mb={24} gap={12}>
          <AutoLayout w="fill" height={1} bg="#E0E0E0" />
          <BaseText color="#999" fontSize={13}>
            또는
          </BaseText>
          <AutoLayout w="fill" height={1} bg="#E0E0E0" />
        </AutoLayout>

        {/* Google 로그인 */}
        <Pressable onPress={handleGoogleLogin} disabled={isPending}>
          <AutoLayout
            w="fill"
            height={52}
            bg="#fff"
            radius={8}
            align="center"
            justify="center"
            style={styles.socialButton}
          >
            <BaseText color="#222" fontSize={16} font="NotoSans-Bold">
              Google로 계속하기
            </BaseText>
          </AutoLayout>
        </Pressable>

        {/* Apple 로그인 (iOS만) */}
        {Platform.OS === 'ios' && (
          <Pressable onPress={handleAppleLogin} disabled={isPending}>
            <AutoLayout
              w="fill"
              height={52}
              bg="#000"
              radius={8}
              align="center"
              justify="center"
              mt={12}
            >
              <BaseText color="#fff" fontSize={16} font="NotoSans-Bold">
                Apple로 계속하기
              </BaseText>
            </AutoLayout>
          </Pressable>
        )}
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
  socialButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});
