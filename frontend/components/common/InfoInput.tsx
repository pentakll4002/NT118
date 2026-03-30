import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface InfoInputProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
}

const InfoInput: React.FC<InfoInputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  editable = true 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={editable}
        placeholderTextColor="#C7C7C7"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 48,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    color: '#000',
  },
  input: {
    flex: 2,
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
    textAlign: 'right',
  },
});

export default InfoInput;
