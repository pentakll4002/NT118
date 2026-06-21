import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Image, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface CustomSearchHeaderProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  onBackPress?: () => void;
  autoFocus?: boolean;
  onAIPress?: () => void;
  onVoicePress?: () => void;
}

const CustomSearchHeader: React.FC<CustomSearchHeaderProps> = ({
  placeholder = "Tìm kiếm trong ShopeeLite...",
  value,
  onChangeText,
  onSubmitEditing,
  onBackPress,
  autoFocus = true,
  onAIPress,
  onVoicePress
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="arrow-back" size={26} color="#4392F9" />
      </TouchableOpacity>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#BDBDBD"
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
        />
        <TouchableOpacity style={styles.cameraIcon} onPress={onAIPress}>
          <Ionicons name="sparkles" size={20} color="#F73658" />
        </TouchableOpacity>
        {onVoicePress && (
          <TouchableOpacity style={styles.micIcon} onPress={onVoicePress}>
            <Ionicons name="mic" size={20} color="#F73658" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.searchButton} onPress={onSubmitEditing}>
          <Ionicons name="search" size={16} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.cartButton} 
        onPress={() => router.push('/cart' as any)}
      >
        <Ionicons name="cart-outline" size={26} color="#4392F9" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1.5,
    borderColor: '#4392F9',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    height: 40,
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat_400Regular',
  },
  cameraIcon: {
    paddingHorizontal: 8,
  },
  micIcon: {
    paddingHorizontal: 8,
  },
  searchButton: {
    backgroundColor: '#4392F9',
    height: '80%',
    width: 46,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  cartButton: {
    marginLeft: 12,
  },
});

export default CustomSearchHeader;
