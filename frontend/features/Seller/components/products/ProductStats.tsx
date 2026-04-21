import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatItem {
  label: string;
  value: number;
  icon: string;
  iconColor: string;
  iconBg: string;
}

interface ProductStatsProps {
  totalProducts: number;
  liveProducts: number;
  soldOutProducts: number;
  reviewingProducts: number;
}

const ProductStats: React.FC<ProductStatsProps> = ({
  totalProducts,
  liveProducts,
  soldOutProducts,
  reviewingProducts,
}) => {
  const stats: StatItem[] = [
    {
      label: 'Tổng sản phẩm',
      value: totalProducts,
      icon: 'cube-outline',
      iconColor: '#3b82f6',
      iconBg: '#eff6ff',
    },
    {
      label: 'Đang bán',
      value: liveProducts,
      icon: 'pricetag-outline',
      iconColor: '#10b981',
      iconBg: '#ecfdf5',
    },
    {
      label: 'Hết hàng',
      value: soldOutProducts,
      icon: 'alert-circle-outline',
      iconColor: '#ef4444',
      iconBg: '#fef2f2',
    },
    {
      label: 'Chờ duyệt',
      value: reviewingProducts,
      icon: 'time-outline',
      iconColor: '#f59e0b',
      iconBg: '#fffbeb',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {stats.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
            </View>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    // shadow iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    // elevation Android
    elevation: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
});

export default ProductStats;
