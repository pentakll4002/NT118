import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          {allChecked && <Ionicons name="checkmark" size={14} color="#FFF" />}
        </View>
        <Text style={styles.allText}>Tất cả</Text>
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.totalLabel}>Tổng thanh toán</Text>
        <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
      </View>

      <Pressable 
        style={[styles.button, selectedCount === 0 && styles.buttonDisabled]} 
        onPress={onCheckout}
        disabled={selectedCount === 0}
      >
        <Text style={styles.buttonText}>Mua hàng ({selectedCount})</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: '#F83758',
    backgroundColor: '#F83758',
  },
  allText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 16,
  },
  totalLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F83758',
    marginTop: 1,
  },
  button: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#F83758',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F83758',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});