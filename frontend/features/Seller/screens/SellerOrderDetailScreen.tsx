import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SellerOrder, sellerApi } from '../../../lib/sellerApi';
import { formatCurrency, formatOrderTime, resolvePaymentStatusLabel, resolveStatusLabel } from '../components/orders/orderHelpers';

const SellerOrderDetailScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [order, setOrder] = useState<SellerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const orders = await sellerApi.getOrders();
      const selected = orders.find((item) => item.id === orderId) ?? null;
      if (!selected) {
        setError('Không tìm thấy đơn hàng.');
      } else {
        setOrder(selected);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

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
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Mã đơn hàng</Text>
            <Text style={styles.mainValue}>#{order.orderNumber}</Text>
            <Text style={styles.meta}>ID đơn: {order.id}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Trạng thái vận hành</Text>
            <Text style={styles.value}>{resolveStatusLabel(order.status)}</Text>
            <Text style={styles.sectionLabel}>Trạng thái thanh toán</Text>
            <Text style={styles.value}>{resolvePaymentStatusLabel(order.paymentStatus)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Người mua</Text>
            <Text style={styles.value}>#{order.buyerId}</Text>
            <Text style={styles.sectionLabel}>Giá trị đơn</Text>
            <Text style={styles.price}>{formatCurrency(order.totalAmount)}</Text>
            <Text style={styles.sectionLabel}>Thời điểm đặt</Text>
            <Text style={styles.value}>{formatOrderTime(order.orderedAt)}</Text>
          </View>
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
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  value: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  meta: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 13,
  },
  price: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '700',
    color: '#ef476f',
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
