import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const ProductPerks: React.FC = () => {
  return (
    <View style={styles.perksCard}>
      <View style={styles.perkRow}>
        <View style={styles.perkIconBg}>
          <MaterialCommunityIcons name="truck-fast-outline" size={20} color="#F83758" />
        </View>
        <View style={styles.perkContent}>
          <Text style={styles.perkTitle}>Miễn phí vận chuyển</Text>
          <Text style={styles.perkSubtitle}>Miễn phí vận chuyển cho đơn hàng từ 0đ</Text>
        </View>
        <Feather name="chevron-right" size={16} color="#BBB" />
      </View>
      
      <View style={styles.perkDivider} />
      
      <View style={styles.perkRow}>
        <View style={styles.perkIconBg}>
          <MaterialCommunityIcons name="shield-check-outline" size={20} color="#F83758" />
        </View>
        <View style={styles.perkContent}>
          <Text style={styles.perkTitle}>Shopee Đảm Bảo</Text>
          <Text style={styles.perkSubtitle}>3 ngày trả hàng / Hoàn tiền</Text>
        </View>
        <Feather name="chevron-right" size={16} color="#BBB" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  perksCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginBottom: 16,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perkIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  perkContent: {
    flex: 1,
  },
  perkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  perkSubtitle: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  perkDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
    marginLeft: 48,
  },
});

export default ProductPerks;
