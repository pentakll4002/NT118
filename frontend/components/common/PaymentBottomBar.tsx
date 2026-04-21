import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';

interface PaymentBottomBarProps {
  finalTotal: number;
  savings: number;
  onOrderPress: () => void;
  loading?: boolean;
}

export default function PaymentBottomBar({ finalTotal, savings, onOrderPress, loading }: PaymentBottomBarProps) {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.bottomLeft}>
         <View style={styles.bottomTotalRow}>
           <Text style={styles.bottomTotalLabel}>Tổng cộng </Text>
           <Text style={styles.bottomTotalPrice}>{finalTotal.toLocaleString('vi-VN')}đ</Text>
         </View>
         <View style={styles.bottomSavingRow}>
           <Text style={styles.bottomSavingLabel}>Tiết kiệm </Text>
           <Text style={styles.bottomSavingPrice}>{savings.toLocaleString('vi-VN')}đ</Text>
         </View>
      </View>
      <TouchableOpacity 
        style={[styles.orderButton, loading && styles.disabledButton]} 
        onPress={onOrderPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={styles.orderButtonText}>Đặt hàng</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  bottomLeft: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  bottomTotalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomTotalLabel: {
    fontSize: 13,
    color: '#333',
  },
  bottomTotalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F83758',
  },
  bottomSavingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  bottomSavingLabel: {
    fontSize: 11,
    color: '#333',
  },
  bottomSavingPrice: {
    fontSize: 11,
    color: '#F83758',
  },
  orderButton: {
    backgroundColor: '#F83758',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#FFA4B4',
  },
  orderButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
