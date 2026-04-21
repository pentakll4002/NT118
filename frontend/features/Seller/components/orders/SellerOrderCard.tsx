import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SellerOrder } from '../../../../lib/sellerApi';
import { formatCurrency, formatOrderTime, resolveStatusLabel } from './orderHelpers';

interface SellerOrderCardProps {
  order: SellerOrder;
}

const SellerOrderCard: React.FC<SellerOrderCardProps> = ({ order }) => {
  const router = useRouter();
  const primaryActionText = order.status === 'pending' ? 'XÁC NHẬN ĐƠN' : 'XỬ LÝ ĐƠN';

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderTop}>
        <Text style={styles.statusTag}>{resolveStatusLabel(order.status)}</Text>
        <Text style={styles.amount}>{formatCurrency(order.totalAmount)}</Text>
      </View>
      <Text style={styles.orderCode}>#{order.orderNumber}</Text>
      <Text style={styles.metaText}>Người mua #{order.buyerId}</Text>
      <View style={styles.shipLine}>
        <Ionicons name="time-outline" size={14} color="#7f8c8d" />
        <Text style={styles.shipText}>Đặt lúc: {formatOrderTime(order.orderedAt)}</Text>
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{primaryActionText}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push(`/seller-order-detail?id=${order.id}` as any)}
        >
          <Text style={styles.secondaryButtonText}>CHI TIẾT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eceef3',
    borderRadius: 12,
    padding: 12,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTag: {
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#ef476f',
    fontWeight: '700',
  },
  amount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  orderCode: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  metaText: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  shipLine: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shipText: {
    color: '#7f8c8d',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  actionsRow: {
    marginTop: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#ef476f',
    borderRadius: 2,
    alignItems: 'center',
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export default SellerOrderCard;
