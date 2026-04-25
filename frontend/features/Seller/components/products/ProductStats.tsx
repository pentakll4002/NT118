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
      label: 'Tất cả',
      value: totalProducts,
      icon: 'cube',
      iconColor: '#3b82f6',
      iconBg: '#eff6ff',
    },
    {
      label: 'Đang bán',
      value: liveProducts,
      icon: 'checkmark-circle',
      iconColor: '#10b981',
      iconBg: '#ecfdf5',
    },
    {
      label: 'Hết hàng',
      value: soldOutProducts,
      icon: 'close-circle',
      iconColor: '#ef4444',
      iconBg: '#fef2f2',
    },
    {
      label: 'Chờ duyệt',
      value: reviewingProducts,
      icon: 'time',
      iconColor: '#f59e0b',
      iconBg: '#fffbeb',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {stats.map((item, index) => (
          <View key={index} style={[styles.card, { borderLeftColor: item.iconColor }]}>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderLeftWidth: 3,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
});

export default ProductStats;
