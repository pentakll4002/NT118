import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getMyOrders, OrderDTO, OrderStatus } from '../../lib/orderApi';

const TABS: { label: string; status: OrderStatus | 'all' }[] = [
  { label: 'Tất cả', status: 'all' },
  { label: 'Chờ xác nhận', status: 'pending' },
  { label: 'Chờ lấy hàng', status: 'confirmed' },
  { label: 'Chờ giao hàng', status: 'shipping' },
  { label: 'Hoàn thành', status: 'delivered' },
  { label: 'Đã hủy', status: 'cancelled' },
  { label: 'Trả hàng/Hoàn tiền', status: 'refunded' },
];

const OrderListPage = () => {
  const router = useRouter();
  const { status } = useLocalSearchParams();
  const [orders, setOrders] = React.useState<OrderDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<OrderStatus | 'all'>((status as any) || 'all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getMyOrders();
      setOrders(data);
    } finally {
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : activeTab === 'refunded'
      ? orders.filter(o => o.status === 'refunded' || o.hasReturnRequest)
      : orders.filter(o => o.status === activeTab && !o.hasReturnRequest);

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao hàng';
      case 'delivered': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'shipping': return '#10b981';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'refunded': return '#6b7280';
      default: return '#000';
    }
  };

  const renderOrderItem = ({ item }: { item: OrderDTO }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => router.push(`/order/${item.id}` as any)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.shopInfo}>
          <Ionicons name="storefront-outline" size={16} color="#666" />
          <Text style={styles.shopName}>Đơn hàng #{item.orderNumber.split('-').pop()}</Text>
        </View>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {getStatusLabel(item.status)}
        </Text>
      </View>

      <View style={styles.orderBody}>
        <View style={styles.orderDetail}>
          <Text style={styles.orderDate}>Ngày đặt: {new Date(item.orderedAt).toLocaleDateString('vi-VN')}</Text>
          <Text style={styles.orderNumber}>Mã đơn: {item.orderNumber}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalAmount}>₫{item.totalAmount.toLocaleString('vi-VN')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn mua của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TABS}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.tab, activeTab === item.status && styles.activeTab]}
              onPress={() => setActiveTab(item.status)}
            >
              <Text style={[styles.tabText, activeTab === item.status && styles.activeTabText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.status}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F73658" />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F73658']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#DDD" />
              <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
  },
  tabsContainer: {
    backgroundColor: 'white',
    paddingBottom: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#F73658',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#666',
  },
  activeTabText: {
    color: '#F73658',
    fontFamily: 'Montserrat_600SemiBold',
  },
  listContent: {
    padding: 12,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shopName: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#333',
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
  },
  orderBody: {
    paddingVertical: 12,
  },
  orderDetail: {
    gap: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  orderNumber: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  totalAmount: {
    fontSize: 16,
    color: '#F73658',
    fontFamily: 'Montserrat_600SemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
});

export default OrderListPage;
