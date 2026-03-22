import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Navigate to main app (tabs) after login
    router.replace('/(tabs)');
  };

  const handleRegister = () => {
    router.push('/register' as any);
  };

  const handleForgotPassword = () => {
    router.push('/forgotPassword' as any)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Chào mừng{'\n'}trở lại!</Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name='person-outline'
              size={24}
              color='#676767'
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder='Tên đăng nhập hoặc email'
              placeholderTextColor='#676767'
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name='lock-closed-outline'
              size={24}
              color='#676767'
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder='Mật khẩu'
              placeholderTextColor='#676767'
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color='#676767'
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>

        {/* Social Login Section */}
        <View style={styles.socialSection}>
          <Text style={styles.socialDividerText}>- HOẶC tiếp tục với -</Text>
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name='google' size={28} color='#EA4335' />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name='apple' size={28} color='#000000' />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name='facebook' size={28} color='#1877F2' />
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            Chưa có tài khoản?{' '}
            <Text style={styles.registerLink} onPress={handleRegister}>
              Đăng ký ngay!
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#F83758',
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  loginButton: {
    backgroundColor: '#F83758',
    height: 55,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  socialSection: {
    marginTop: 60,
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
  registerContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#575757',
    fontFamily: 'Montserrat_500Medium',
  },
  registerLink: {
    color: '#F83758',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
