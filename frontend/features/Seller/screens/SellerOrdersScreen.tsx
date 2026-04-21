import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomTabBar from '../components/BottomTabBar';
import { SellerOrder, sellerApi } from '../../../lib/sellerApi';
import SellerOrdersHeader from '../components/orders/SellerOrdersHeader';
import SellerOrdersStateView from '../components/orders/SellerOrdersStateView';
import SellerOrdersStats from '../components/orders/SellerOrdersStats';
import SellerOrdersTabs from '../components/orders/SellerOrdersTabs';
import SellerOrderCard from '../components/orders/SellerOrderCard';
import SellerOrdersEmptyState from '../components/orders/SellerOrdersEmptyState';
import { computeQuickStats, isOrderMatchedByTab, normalizeQueryFilter } from '../components/orders/orderHelpers';
import { ORDER_TABS, OrderTab } from '../components/orders/orderTypes';

const SellerOrdersScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrderTab>('all');

  useEffect(() => {
    setActiveTab(normalizeQueryFilter(params.filter));
  }, [params.filter]);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const list = await sellerApi.getOrders();
      setOrders(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => isOrderMatchedByTab(order, activeTab)),
    [orders, activeTab]
  );

  const quickStats = useMemo(() => computeQuickStats(orders), [orders]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <SellerOrdersHeader onBackPress={() => router.back()} />

      {loading && !refreshing ? (
        <SellerOrdersStateView loading error={null} onRetry={() => fetchOrders()} />
      ) : error ? (
        <SellerOrdersStateView loading={false} error={error} onRetry={() => fetchOrders()} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(true)} />}
          contentContainerStyle={styles.content}
        >
          <SellerOrdersStats
            total={quickStats.total}
            toShip={quickStats.toShip}
            shipping={quickStats.shipping}
            completed={quickStats.completed}
          />

          <SellerOrdersTabs tabs={ORDER_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'returns' && (
            <View style={styles.infoBanner}>
              <Ionicons name="return-up-back-outline" size={16} color="#b45309" />
              <Text style={styles.infoText}>Yêu cầu hoàn trả: {quickStats.returns} đơn cần kiểm tra.</Text>
            </View>
          )}

          {filteredOrders.length === 0 ? (
            <SellerOrdersEmptyState />
          ) : (
            filteredOrders.map((order) => <SellerOrderCard key={order.id} order={order} />)
          )}
        </ScrollView>
      )}

      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f8',
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 12,
  },
  infoBanner: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SellerOrdersScreen;
