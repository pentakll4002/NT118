import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatPrice } from './cart.utils';

type CartShippingProgressProps = {
  currentAmount: number;
  targetAmount: number;
};

export default function CartShippingProgress({
  currentAmount,
  targetAmount,
}: CartShippingProgressProps) {
  const remaining = Math.max(targetAmount - currentAmount, 0);
  const progress = Math.min(currentAmount / targetAmount, 1);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.leftSection}>
          <MaterialCommunityIcons name="truck-fast" size={24} color="#3B82F6" style={styles.truckIcon} />
          <View>
            <Text style={styles.titleText}>
              Miễn phí vận chuyển đơn hàng từ
            </Text>
            <Text style={styles.targetText}>
              {targetAmount / 1000}k
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          {remaining > 0 ? (
            <Text style={styles.remainingText}>
              Còn {formatPrice(remaining)}
            </Text>
          ) : (
            <Text style={styles.remainingText}>Đã đạt</Text>
          )}
        </View>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  truckIcon: {
    marginRight: 12,
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 12,
  },
  titleText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  targetText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '700',
    marginTop: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  remainingText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  track: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
});