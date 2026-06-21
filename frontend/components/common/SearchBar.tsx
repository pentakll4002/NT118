import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Animated, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onVoicePress?: () => void;
  onSubmitEditing?: () => void;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  onAIPress?: () => void;
  onAISearchResult?: (result: any) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Tên sản phẩm", 
  value, 
  onChangeText,
  onVoicePress,
  onSubmitEditing,
  onPress,
  editable = true,
  autoFocus = false,
  onAIPress,
  onAISearchResult,
}) => {
  const [isAILoading, setIsAILoading] = useState(false);
  const aiPulse = useRef(new Animated.Value(1)).current;

  // Pulsing animation when AI is processing
  useEffect(() => {
    if (isAILoading) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(aiPulse, { toValue: 0.5, duration: 600, useNativeDriver: true }),
          Animated.timing(aiPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    } else {
      aiPulse.setValue(1);
    }
  }, [isAILoading]);

  const handleAIPress = useCallback(async () => {
    if (onAIPress) {
      onAIPress();
      return;
    }

    // If no external handler, do inline AI parse
    if (!value?.trim() || isAILoading) return;

    setIsAILoading(true);
    try {
      const { aiParseSearch } = await import('../../lib/chatApi');
      const result = await aiParseSearch(value.trim());
      if (onAISearchResult) {
        onAISearchResult(result);
      }
      // Update the search text with the extracted query
      if (result.extracted_query && onChangeText) {
        onChangeText(result.extracted_query);
      }
      // Auto-submit after AI parse
      if (onSubmitEditing) {
        setTimeout(() => onSubmitEditing(), 100);
      }
    } catch (error) {
      console.log('AI search parse error:', error);
    } finally {
      setIsAILoading(false);
    }
  }, [value, isAILoading, onAIPress, onAISearchResult, onChangeText, onSubmitEditing]);

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        {onPress ? (
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={onPress}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          >
            <Ionicons name="search" size={20} color="#BBBBBB" />
            <Text style={[styles.searchInput, { paddingVertical: 10 }]}>{value || placeholder}</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Ionicons name="search" size={20} color="#BBBBBB" />
            <TextInput 
              placeholder={placeholder}
              placeholderTextColor="#BBBBBB"
              style={styles.searchInput}
              value={value}
              onChangeText={onChangeText}
              returnKeyType="search"
              onSubmitEditing={onSubmitEditing}
              editable={editable}
              autoFocus={autoFocus}
            />
          </>
        )}
        {(onAIPress || onAISearchResult) && (
          <TouchableOpacity
            onPress={handleAIPress}
            style={styles.aiButton}
            disabled={isAILoading}
            activeOpacity={0.7}
          >
            {isAILoading ? (
              <ActivityIndicator size={16} color="#F73658" />
            ) : (
              <Animated.View style={{ opacity: aiPulse }}>
                <Ionicons name="sparkles" size={20} color="#F73658" />
              </Animated.View>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onVoicePress} style={styles.voiceButton}>
          <MaterialCommunityIcons name="microphone" size={24} color="#F73658" />
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
  aiButton: {
    marginRight: 8,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    paddingLeft: 8,
    paddingRight: 4,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar;