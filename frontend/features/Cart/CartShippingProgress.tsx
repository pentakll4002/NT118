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
    backgroundColor: '#EAF3FF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#D6E4FF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  truckIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  titleText: {
    fontSize: 13,
    color: '#3B82F6',
    flexWrap: 'wrap',
  },
  targetText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 2,
  },
  rightSection: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginLeft: 8,
    paddingTop: 18,
  },
  remainingText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  track: {
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#438AFE',
    borderRadius: 999,
  },
});