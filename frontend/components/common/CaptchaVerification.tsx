import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type CaptchaVerificationProps = {
  onValidChange: (isValid: boolean) => void;
  mode?: 'local' | 'email';
  emailCodeValue?: string;
  onEmailCodeChange?: (text: string) => void;
  onRequestEmailCode?: () => void;
};

function createCaptcha(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const CaptchaVerification: React.FC<CaptchaVerificationProps> = ({
  onValidChange,
  mode = 'local',
  emailCodeValue,
  onEmailCodeChange,
  onRequestEmailCode,
}) => {
  const [captcha, setCaptcha] = useState(() => createCaptcha());
  const [input, setInput] = useState(emailCodeValue ?? '');
  const currentInput = mode === 'email' ? (emailCodeValue ?? '') : input;

  const isValid = useMemo(
    () => (mode === 'email' ? currentInput.trim().length === 6 : currentInput.trim().toUpperCase() === captcha),
    [captcha, currentInput, mode],
  );

  useEffect(() => {
    onValidChange(isValid);
  }, [isValid, onValidChange]);

  const refreshCaptcha = () => {
    setCaptcha(createCaptcha());
    if (mode === 'email') {
      onEmailCodeChange?.('');
      onRequestEmailCode?.();
      return;
    }
    setInput('');
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Xác thực captcha</Text>
      <View style={styles.row}>
        {mode === 'local' ? <Text style={styles.captchaText}>{captcha}</Text> : <View style={styles.emailCodeHint}><Text style={styles.emailCodeHintText}>Nhập mã gồm 6 số đã gửi qua Gmail</Text></View>}
        <TouchableOpacity style={styles.refreshButton} onPress={refreshCaptcha}>
          <Text style={styles.refreshText}>{mode === 'local' ? 'Làm mới' : 'Gửi lại mã'}</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder={mode === 'local' ? 'Nhập mã captcha ở trên' : 'Nhập mã xác thực từ email'}
        placeholderTextColor="#8A8A8A"
        value={currentInput}
        onChangeText={(text) => {
          if (mode === 'email') {
            const normalized = text.replace(/[^0-9]/g, '').slice(0, 6);
            onEmailCodeChange?.(normalized);
            return;
          }
          setInput(text);
        }}
        autoCapitalize="characters"
        keyboardType={mode === 'email' ? 'number-pad' : 'default'}
      />
      <Text style={[styles.helperText, isValid ? styles.validText : styles.invalidText]}>
        {mode === 'local'
          ? (isValid ? 'Captcha hợp lệ' : 'Vui lòng nhập đúng mã captcha')
          : (isValid ? 'Mã email hợp lệ' : 'Nhập đủ 6 số để xác thực')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
  },
  label: {
    fontSize: 13,
    color: '#444',
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  captchaText: {
    flex: 1,
    marginRight: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A8A8A9',
    backgroundColor: '#F3F3F3',
    fontSize: 20,
    letterSpacing: 3,
    color: '#111',
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },
  emailCodeHint: {
    flex: 1,
    marginRight: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A8A8A9',
    backgroundColor: '#F3F3F3',
  },
  emailCodeHintText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Montserrat_500Medium',
  },
  refreshButton: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  input: {
    height: 52,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#CFCFCF',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#000',
    fontFamily: 'Montserrat_500Medium',
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  validText: {
    color: '#2E7D32',
  },
  invalidText: {
    color: '#D32F2F',
  },
});

export default CaptchaVerification;
