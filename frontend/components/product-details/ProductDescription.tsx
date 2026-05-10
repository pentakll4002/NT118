import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ProductDescriptionProps {
  description: string;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ description }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.detailsSection}>
      <Text style={styles.detailsTitle}>Mô tả sản phẩm</Text>
      <Text 
        style={styles.detailDescriptionParagraph}
        numberOfLines={expanded ? undefined : 5}
      >
        {description || 'Chưa có mô tả cho sản phẩm này.'}
      </Text>
      <TouchableOpacity 
        style={styles.viewMoreButton}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.viewMoreText}>{expanded ? 'Thu gọn' : 'Xem thêm'}</Text>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color="#F83758" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  detailsSection: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  detailDescriptionParagraph: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    gap: 4,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F83758',
  },
});

export default ProductDescription;
