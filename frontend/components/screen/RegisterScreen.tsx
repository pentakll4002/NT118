import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { registerRequest, sendRegisterCaptchaRequest } from '@/lib/authApi';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import CaptchaVerification from '@/components/common/CaptchaVerification';

const { width } = Dimensions.get('window');

const RegisterScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showCaptchaStep, setShowCaptchaStep] = useState(false);
  const [emailCaptchaCode, setEmailCaptchaCode] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validateRegisterFields = () => {
    if (!email.trim() || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập email và mật khẩu');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp');
      return false;
    }
    if (!agreeToTerms) {
      Alert.alert('Thông báo', 'Vui lòng đồng ý điều khoản dịch vụ');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateRegisterFields()) return;
    if (!showCaptchaStep) {
      setSubmitting(true);
      try {
        await sendRegisterCaptchaRequest(email);
        setShowCaptchaStep(true);
        setEmailCaptchaCode('');
        setIsCaptchaValid(false);
        Alert.alert('Xác thực', 'Mã captcha đã được gửi qua Gmail. Vui lòng nhập mã để hoàn tất đăng ký.');
      } catch (e) {
        Alert.alert('Không gửi được mã', e instanceof Error ? e.message : 'Lỗi không xác định');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if (!isCaptchaValid) {
      Alert.alert('Thông báo', 'Vui lòng nhập đúng captcha');
      return;
    }
    setSubmitting(true);
    try {
      await registerRequest(email, password, emailCaptchaCode);
      Alert.alert('Thành công', 'Đăng ký thành công');
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Đăng ký thất bại', e instanceof Error ? e.message : 'Lỗi không xác định');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = () => {
    router.push('/login' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Tạo{"\n"}Tài khoản</Text>
          </View>

          {/* Form Inputs */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={24} color="#676767" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tên đăng nhập hoặc email"
                placeholderTextColor="#676767"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#676767" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#676767"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={24} 
                  color="#676767" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#676767" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor="#676767"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={24} 
                  color="#676767" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.termsContainer}>
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={agreeToTerms ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={agreeToTerms ? "#F83758" : "#676767"} 
                />
              </TouchableOpacity>
              <Text style={styles.termsText}>
                Bằng cách đăng ký, bạn đồng ý với{' '}
                <Text style={styles.termsLink}>Điều khoản dịch vụ</Text> và{' '}
                <Text style={styles.termsLink}>Chính sách bảo mật</Text> của chúng tôi.
              </Text>
            </View>
          </View>

          {showCaptchaStep ? (
            <View style={styles.captchaSection}>
              <CaptchaVerification
                mode="email"
                onValidChange={setIsCaptchaValid}
                emailCodeValue={emailCaptchaCode}
                onEmailCodeChange={setEmailCaptchaCode}
                onRequestEmailCode={async () => {
                  try {
                    await sendRegisterCaptchaRequest(email);
                    Alert.alert('Thông báo', 'Đã gửi lại mã captcha qua Gmail');
                  } catch (e) {
                    Alert.alert('Không gửi được mã', e instanceof Error ? e.message : 'Lỗi không xác định');
                  }
                }}
              />
              <TouchableOpacity
                style={styles.backStepContainer}
                onPress={() => {
                  setShowCaptchaStep(false);
                  setIsCaptchaValid(false);
                  setEmailCaptchaCode('');
                }}
              >
                <Text style={styles.backStepText}>Quay lại chỉnh thông tin</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, submitting && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={submitting || (showCaptchaStep && !isCaptchaValid)}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>
                {showCaptchaStep ? 'Xác nhận captcha và đăng ký' : 'Đăng ký'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Social Login Section */}
          <View style={styles.socialSection}>
            <Text style={styles.socialDividerText}>- HOẶC tiếp tục với -</Text>
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="google" size={28} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="apple" size={28} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="facebook" size={28} color="#1877F2" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Bạn đã có tài khoản?{' '}
              <Text style={styles.loginLink} onPress={handleLogin}>
                Đăng nhập ngay!
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000',
    lineHeight: 45,
    fontFamily: 'Montserrat_800ExtraBold',
  },
  form: {
    gap: 25,
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
  termsContainer: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkboxContainer: {
    marginTop: -2,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#676767',
    lineHeight: 18,
    fontFamily: 'Montserrat_400Regular',
  },
  termsLink: {
    color: '#F83758',
    fontWeight: '600',
  },
  captchaSection: {
    marginTop: 16,
  },
  backStepContainer: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  backStepText: {
    color: '#F83758',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  registerButton: {
    backgroundColor: '#F83758',
    height: 55,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  socialSection: {
    marginTop: 50,
    alignItems: 'center',
  },
  socialDividerText: {
    fontSize: 12,
    color: '#575757',
    marginBottom: 20,
    fontFamily: 'Montserrat_500Medium',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#F83758',
    backgroundColor: '#FDF9F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#575757',
    fontFamily: 'Montserrat_500Medium',
  },
  loginLink: {
    color: '#F83758',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
