import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SellerOrdersStatsProps {
  total: number;
  toShip: number;
  shipping: number;
  completed: number;
}

const SellerOrdersStats: React.FC<SellerOrdersStatsProps> = ({ total, toShip, shipping, completed }) => {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statsCard}>
        <Text style={styles.statsValue}>{total}</Text>
        <Text style={styles.statsLabel}>Tổng đơn</Text>
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.statsValue}>{toShip}</Text>
        <Text style={styles.statsLabel}>Chờ giao</Text>
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.statsValue}>{shipping}</Text>
        <Text style={styles.statsLabel}>Đang giao</Text>
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.statsValue}>{completed}</Text>
        <Text style={styles.statsLabel}>Hoàn tất</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eceef3',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statsLabel: {
    marginTop: 2,
    fontSize: 11,
    color: '#6b7280',
  },
});

export default SellerOrdersStats;
