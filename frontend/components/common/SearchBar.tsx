import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onVoicePress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Tên sản phẩm", 
  value, 
  onChangeText,
  onVoicePress 
}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#BBBBBB" />
        <TextInput 
          placeholder={placeholder}
          placeholderTextColor="#BBBBBB"
          style={styles.searchInput}
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity onPress={onVoicePress}>
          <MaterialCommunityIcons name="microphone-outline" size={24} color="#BBBBBB" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 9,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#BBBBBB',
  },
});

export default SearchBar;
