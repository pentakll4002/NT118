import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatPrice } from './cart.utils';

type CartBottomBarProps = {
  allChecked: boolean;
  totalPrice: number;
  selectedCount: number;
  onToggleAll?: () => void;
  onCheckout?: () => void;
};


export default function CartBottomBar({
  allChecked,
  totalPrice,
  selectedCount,
  onToggleAll,
  onCheckout,
}: CartBottomBarProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.left} onPress={onToggleAll}>
        <View style={[styles.checkbox, allChecked && styles.checkboxChecked]}>
          {allChecked ? <View style={styles.checkboxInner} /> : null}
        </View>
        <Text style={styles.allText}>Tất cả</Text>
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.totalLabel}>Tổng cộng</Text>
        <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
      </View>

      <Pressable style={styles.button} onPress={onCheckout}>
        <Text style={styles.buttonText}>Mua hàng ({selectedCount})</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 68,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 74,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: '#FF4D4F',
    backgroundColor: '#FF4D4F',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  allText: {
    fontSize: 13,
    color: '#111827',
  },
  center: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 2,
  },
  button: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});