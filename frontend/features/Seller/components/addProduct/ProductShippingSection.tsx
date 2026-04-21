import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductShippingSectionProps {
  weight: string;
  onWeightChange: (value: string) => void;
  onPressShippingFee: () => void;
}

const ProductShippingSection: React.FC<ProductShippingSectionProps> = ({
  weight,
  onWeightChange,
  onPressShippingFee,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Vận chuyển</Text>

      <View style={styles.shipCard}>
        <View style={styles.shipIcon}>
          <Ionicons name="scale-outline" size={16} color="#3b82f6" />
        </View>
        <View style={styles.shipBody}>
          <Text style={styles.shipLabel}>CÂN NẶNG (SAU ĐÓNG GÓI)</Text>
          <View style={styles.shipValueRow}>
            <TextInput
              style={styles.shipInput}
              value={weight}
              onChangeText={onWeightChange}
              placeholder="0"
              keyboardType="number-pad"
              placeholderTextColor="#9aa0a6"
            />
            <Text style={styles.shipUnit}>g</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.selectorRow} activeOpacity={0.8} onPress={onPressShippingFee}>
        <View>
          <Text style={styles.selectorLabel}>PHÍ VẬN CHUYỂN</Text>
          <Text style={styles.selectorText}>Kích hoạt các đơn vị vận chuyển</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9aa0a6" />
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
  shipCard: {
    marginTop: 10,
    backgroundColor: '#fafbfc',
    borderWidth: 1,
    borderColor: '#edf0f3',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shipIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#eaf2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shipBody: {
    flex: 1,
  },
  shipLabel: {
    fontSize: 9,
    color: '#9aa0a6',
    fontWeight: '700',
  },
  shipValueRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  shipInput: {
    fontSize: 24,
    color: '#2c3e50',
    minWidth: 60,
    paddingVertical: 0,
  },
  shipUnit: {
    fontSize: 13,
    color: '#6c757d',
  },
  selectorRow: {
    marginTop: 10,
    backgroundColor: '#fafbfc',
    borderWidth: 1,
    borderColor: '#edf0f3',
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorLabel: {
    fontSize: 9,
    color: '#9aa0a6',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  selectorText: {
    marginTop: 4,
    fontSize: 13,
    color: '#2c3e50',
  },
});

export default ProductShippingSection;
