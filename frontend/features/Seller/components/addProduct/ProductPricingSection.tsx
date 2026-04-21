import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductPricingSectionProps {
  price: string;
  stock: string;
  onPriceChange: (value: string) => void;
  onStockChange: (value: string) => void;
  onPressVariation: () => void;
}

const ProductPricingSection: React.FC<ProductPricingSectionProps> = ({
  price,
  stock,
  onPriceChange,
  onStockChange,
  onPressVariation,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Giá và kho hàng</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>GIÁ BÁN</Text>
        <View style={styles.iconInputRow}>
          <Ionicons name="cash-outline" size={16} color="#9aa0a6" />
          <TextInput
            style={styles.valueInput}
            value={price}
            onChangeText={onPriceChange}
            placeholder="0"
            keyboardType="number-pad"
            placeholderTextColor="#9aa0a6"
          />
          <Text style={styles.unitText}>đ</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>KHO HÀNG</Text>
        <View style={styles.iconInputRow}>
          <Ionicons name="cube-outline" size={16} color="#9aa0a6" />
          <TextInput
            style={styles.valueInput}
            value={stock}
            onChangeText={onStockChange}
            placeholder="0"
            keyboardType="number-pad"
            placeholderTextColor="#9aa0a6"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.variationRow} activeOpacity={0.8} onPress={onPressVariation}>
        <Ionicons name="add-circle" size={16} color="#d6336c" />
        <Text style={styles.variationText}>PHÂN LOẠI HÀNG (MÀU SẮC, KÍCH THƯỚC...)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    borderRadius: 2,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2b2d42',
  },
  inputGroup: {
    marginTop: 12,
    backgroundColor: '#fafbfc',
    borderWidth: 1,
    borderColor: '#edf0f3',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputLabel: {
    fontSize: 9,
    color: '#9aa0a6',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  iconInputRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueInput: {
    fontSize: 24,
    color: '#2c3e50',
    flex: 1,
    paddingVertical: 0,
  },
  unitText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
  },
  variationRow: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e6e7eb',
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  variationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
});

export default ProductPricingSection;
