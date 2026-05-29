import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SellerOrderDetail, sellerApi } from '../../../lib/sellerApi';

const STATUS_FLOW: Record<string, { next: string; label: string; color: string }[]> = {
  pending: [
    { next: 'confirmed', label: 'Xác nhận đơn', color: '#10b981' },
    { next: 'cancelled', label: 'Hủy đơn', color: '#ef4444' },
  ],
  confirmed: [
    { next: 'shipping', label: 'Giao hàng', color: '#3b82f6' },
    { next: 'cancelled', label: 'Hủy đơn', color: '#ef4444' },
  ],
  shipping: [
    { next: 'delivered', label: 'Đã giao hàng', color: '#10b981' },
  ],
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'CHỜ XÁC NHẬN',
  confirmed: 'CHỜ GIAO',
  shipping: 'ĐANG GIAO',
  delivered: 'HOÀN TẤT',
  cancelled: 'ĐÃ HUỶ',
  refunded: 'HOÀN TRẢ',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
  refunded: 'Đã hoàn tiền',
};

const formatCurrency = (amount: number) => `₫${amount.toLocaleString('vi-VN')}`;
const formatTime = (iso: string) => new Date(iso).toLocaleString('vi-VN');

const SellerOrderDetailScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [detail, setDetail] = useState<SellerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const orderId = useMemo(() => Number(id), [id]);
  const androidTopInset = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

  const fetchOrder = useCallback(async () => {
    if (!orderId || Number.isNaN(orderId)) {
      setError('Mã đơn hàng không hợp lệ.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await sellerApi.getOrderDetail(orderId);
      setDetail(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusUpdate = async (newStatus: string, label: string) => {
    if (newStatus === 'cancelled') {
      Alert.alert('Xác nhận', `Bạn có chắc muốn hủy đơn hàng này?`, [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', style: 'destructive', onPress: () => doUpdate(newStatus, label) },
      ]);
    } else {
      doUpdate(newStatus, label);
    }
  };

  const doUpdate = async (newStatus: string, label: string) => {
    try {
      setUpdating(true);
      const result = await sellerApi.updateOrderStatus(orderId, newStatus);
      Alert.alert('Thành công', result.message);
      fetchOrder();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Cập nhật thất bại.');
    } finally {
      setUpdating(false);
    }
  };

  const order = detail?.order;
  const items = detail?.items || [];
  const buyer = detail?.buyer;
  const address = detail?.shippingAddress;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, androidTopInset) + 6 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>Chi tiết đơn hàng</Text>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#ef476f" />
          <Text style={styles.stateText}>Đang tải chi tiết đơn...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={44} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrder}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : order ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Number & Status */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Mã đơn hàng</Text>
            <Text style={styles.mainValue}>#{order.orderNumber}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: order.status === 'delivered' ? '#10b981' : order.status === 'cancelled' ? '#ef4444' : '#f59e0b' }]}>
                <Text style={styles.statusBadgeText}>{STATUS_LABELS[order.status] || order.status}</Text>
              </View>
              <View style={[styles.paymentBadge]}>
                <Text style={styles.paymentBadgeText}>{PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}</Text>
              </View>
            </View>
          </View>

          {/* Buyer Info */}
          {buyer && (
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Thông tin người mua</Text>
              <Text style={styles.value}>{buyer.username}</Text>
              <Text style={styles.meta}>{buyer.email}</Text>
              {buyer.phone && <Text style={styles.meta}>SĐT: {buyer.phone}</Text>}
            </View>
          )}

          {/* Shipping Address */}
          {address && (
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Địa chỉ giao hàng</Text>
              <Text style={styles.value}>{address.recipientName} | {address.recipientPhone}</Text>
              <Text style={styles.meta}>
                {address.streetAddress}, {address.ward}, {address.district}, {address.province}
              </Text>
            </View>
          )}

          {/* Order Items */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Sản phẩm ({items.length})</Text>
            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                {item.productImage && (
                  <Image source={{ uri: item.productImage }} style={styles.itemImage} />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                  <View style={styles.itemPriceRow}>
                    <Text style={styles.itemPrice}>{formatCurrency(item.unitPrice)}</Text>
                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Payment Summary */}
          <View style={styles.card}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng tiền hàng</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.shippingFee)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giảm giá</Text>
              <Text style={[styles.summaryValue, { color: '#ef476f' }]}>-{formatCurrency(order.discountAmount)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Thành tiền</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
            </View>
          </View>

          {/* Order Meta */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Phương thức thanh toán</Text>
            <Text style={styles.value}>{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}</Text>
            <Text style={styles.sectionLabel}>Thời gian đặt hàng</Text>
            <Text style={styles.value}>{formatTime(order.orderedAt)}</Text>
            {order.notes && (
              <>
                <Text style={styles.sectionLabel}>Ghi chú</Text>
                <Text style={styles.value}>{order.notes}</Text>
              </>
            )}
          </View>

          {/* Action Buttons */}
          {STATUS_FLOW[order.status] && (
            <View style={styles.actionsContainer}>
              {STATUS_FLOW[order.status].map((action) => (
                <TouchableOpacity
                  key={action.next}
                  style={[styles.actionButton, { backgroundColor: action.color }, updating && { opacity: 0.6 }]}
                  onPress={() => handleStatusUpdate(action.next, action.label)}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.actionButtonText}>{action.label}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {order.status === 'refunded' && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                onPress={() => router.push(`/seller/returns?filter=returns` as any)}
              >
                <Text style={styles.actionButtonText}>Xem ở mục Hoàn Trả</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f8',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eceef3',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  backButton: {
    padding: 6,
    marginRight: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 12,
    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eceef3',
    borderRadius: 12,
    padding: 14,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
  },
  mainValue: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  value: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  meta: {
    marginTop: 2,
    color: '#6b7280',
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e0e7ff',
  },
  paymentBadgeText: {
    color: '#3730a3',
    fontSize: 12,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef476f',
  },
  itemQty: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eceef3',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ef476f',
  },
  actionsContainer: {
    gap: 10,
  },
  actionButton: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  stateText: {
    marginTop: 8,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 10,
    color: '#e74c3c',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ef476f',
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default SellerOrderDetailScreen;
