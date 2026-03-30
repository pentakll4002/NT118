import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSizeSelect: (size: string) => void;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({ sizes, selectedSize, onSizeSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Size: {selectedSize}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sizeList}>
        {sizes.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeButton,
              selectedSize === size ? styles.selectedSizeButton : styles.unselectedSizeButton,
            ]}
            onPress={() => onSizeSelect(size)}
          >
            <Text
              style={[
                styles.sizeText,
                selectedSize === size ? styles.selectedSizeText : styles.unselectedSizeText,
              ]}
            >
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
    marginBottom: 12,
  },
  sizeList: {
    gap: 8,
  },
  sizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  selectedSizeButton: {
    backgroundColor: '#F73658',
  },
  unselectedSizeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#F97189',
  },
  sizeText: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
  selectedSizeText: {
    color: '#FFF',
  },
  unselectedSizeText: {
    color: '#F97189',
  },
});

export default SizeSelector;
