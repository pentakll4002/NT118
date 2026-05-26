import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProductSpecsProps {
  categoryName: string;
  brandName?: string;
  stockQuantity: number;
}

const ProductSpecs: React.FC<ProductSpecsProps> = ({ categoryName, brandName, stockQuantity }) => {
  return (
    <View style={styles.specsCard}>
      <View style={styles.specItem}>
        <Text style={styles.specLabel}>DANH MỤC</Text>
        <Text style={styles.specValue} numberOfLines={1}>{categoryName}</Text>
      </View>
      <View style={styles.specVertDivider} />
      <View style={styles.specItem}>
        <Text style={styles.specLabel}>THƯƠNG HIỆU</Text>
        <Text style={styles.specValue} numberOfLines={1}>{brandName || 'No Brand'}</Text>
      </View>
      <View style={styles.specVertDivider} />
      <View style={styles.specItem}>
        <Text style={styles.specLabel}>KHO HÀNG</Text>
        <Text style={styles.specValue}>{stockQuantity}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  specsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderTopWidth: 8,
    borderTopColor: '#f5f5f5',
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  specVertDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#eee',
    alignSelf: 'center',
  },
});

export default ProductSpecs;
