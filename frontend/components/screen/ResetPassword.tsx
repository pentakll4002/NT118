import React, { useEffect, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { forgotPasswordRequest, resetPasswordRequest } from '@/lib/authApi';

const ResetPassword = () => {
  const router = useRouter();
  const { email, presetCode } = useLocalSearchParams<{ email?: string; presetCode?: string }>();

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof presetCode === 'string' && presetCode.length > 0) {
      setCode(presetCode);
    }
  }, [presetCode]);

  const handleResetPassword = async () => {
    if (!code.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã xác thực');
      return;
    }

    if (!password || !confirmPassword) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ mật khẩu');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp');
      return;
    }

    const emailStr = typeof email === 'string' ? email : Array.isArray(email) ? email[0] : '';
    if (!emailStr?.trim()) {
      Alert.alert('Thông báo', 'Thiếu email. Quay lại bước quên mật khẩu.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPasswordRequest(emailStr, code, password);
      Alert.alert('Thành công', 'Đổi mật khẩu thành công', [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]);
    } catch (e) {
      Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không đặt lại được mật khẩu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    const emailStr = typeof email === 'string' ? email : Array.isArray(email) ? email[0] : '';
    if (!emailStr?.trim()) {
      Alert.alert('Thông báo', 'Thiếu email');
      return;
    }
    try {
      const res = await forgotPasswordRequest(emailStr);
      if (res.resetCode) setCode(res.resetCode);
      Alert.alert('Thông báo', 'Đã tạo mã mới (kiểm tra email hoặc mã dev).');
    } catch (e) {
      Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không gửi lại được mã');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {'\n'}Đặt lại
            {'\n'}Mật khẩu
          </Text>

          <Text style={styles.subText}>
            {email
              ? `Nhập mã đã gửi đến ${email}`
              : 'Nhập mã xác thực và mật khẩu mới'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="key-outline"
              size={22}
              color="#676767"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Nhập mã xác thực"
              placeholderTextColor="#676767"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color="#676767"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu mới"
              placeholderTextColor="#676767"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color="#676767"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color="#676767"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor="#676767"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color="#676767"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.resendContainer}
          onPress={handleResendCode}>
          <Text style={styles.resendText}>Gửi lại mã</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Xác nhận</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 50,
  },
  header: {
    marginBottom: 35,
  },
  title: {
    fontSize: 36,
    lineHeight: 45,
    fontWeight: '800',
    color: '#000',
    fontFamily: 'Montserrat_800ExtraBold',
  },
  subText: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
    color: '#7A7A7A',
    fontFamily: 'Montserrat_500Medium',
  },
  form: {
    gap: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderColor: '#A8A8A9',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 55,
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
  resendContainer: {
    marginTop: 18,
    alignSelf: 'flex-end',
  },
  resendText: {
    color: '#F83758',
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
  },
  button: {
    backgroundColor: '#F83758',
    height: 55,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
});