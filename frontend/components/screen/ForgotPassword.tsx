import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSend = () => {
    if (!email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập email');
      return;
    }

    router.push({
      pathname: '/resetPassword',
      params: { email },
    } as any);
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

        {/* Button */}
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Gửi</Text>
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
  sendButtonText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
});
