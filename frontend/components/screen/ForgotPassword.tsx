import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { forgotPasswordRequest } from '@/lib/authApi';
import CaptchaVerification from '@/components/common/CaptchaVerification';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập email');
      return;
    }
    if (!isCaptchaValid) {
      Alert.alert('Thông báo', 'Vui lòng xác thực captcha trước khi gửi');
      return;
    }

    setSubmitting(true);
    try {
      await forgotPasswordRequest(email);

      router.push({
        pathname: '/resetPassword',
        params: { email: email.trim() },
      } as any);
    } catch (e) {
      Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không gửi được yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Quên{'\n'}Mật khẩu?
          </Text>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail"
            size={20}
            color="#676767"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nhập địa chỉ email của bạn"
            placeholderTextColor="#8A8A8A"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Note */}
        <Text style={styles.note}>
          * Mã đặt lại mật khẩu sẽ được gửi đến email của bạn
        </Text>

        <CaptchaVerification onValidChange={setIsCaptchaValid} />

        {/* Button */}
        <TouchableOpacity
          style={[styles.sendButton, submitting && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={submitting || !isCaptchaValid}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 28,
  },
  title: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '800',
    color: '#000',
    fontFamily: 'Montserrat_800ExtraBold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#CFCFCF',
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontFamily: 'Montserrat_500Medium',
  },
  note: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    color: '#8A8A8A',
    fontFamily: 'Montserrat_500Medium',
  },
  sendButton: {
    marginTop: 28,
    height: 52,
    backgroundColor: '#FF3B5F',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
});
