import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import BusinessInsights from '../components/dashboard/BusinessInsights';
import TodoList from '../components/dashboard/TodoList';
import CampaignCard from '../components/CampaignCard';
import BottomTabBar from '../components/BottomTabBar';
import { useSellerDashboard } from '../hooks/useSellerDashboard';
import { Ionicons } from '@expo/vector-icons';

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const { stats, loading, refreshing, error, onRefresh, retry } =
    useSellerDashboard();
  const hasBusinessData =
    !!stats && (stats.todayOrders > 0 || stats.todayRevenue > 0 || (stats.totalOrders || 0) > 0);

  const { useFocusEffect } = require('expo-router');

  useFocusEffect(
    React.useCallback(() => {
      retry();
    }, [retry])
  );

  React.useEffect(() => {
    if (error) {
      console.error('[DashboardScreen] Connection Error:', error);
    }
  }, [error]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          shopName='Đang tải...'
          onBackPress={() => router.replace('/(tabs)/settings')}
        />
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonGrid}>
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
          </View>
          <View style={styles.skeletonGrid}>
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
          </View>
          <View style={styles.skeletonPanel} />
          <View style={styles.skeletonPanel} />
        </View>
        <BottomTabBar />
      </SafeAreaView>
    );
  }

  if (error && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          shopName='Lỗi'
          onBackPress={() => router.replace('/(tabs)/settings')}
        />
        <View style={styles.centerContainer}>
          <Ionicons name='alert-circle-outline' size={64} color='#e74c3c' />
          <Text style={styles.errorText}>
            {error || 'Không thể kết nối đến máy chủ'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => retry()}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
        <BottomTabBar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' backgroundColor='#fff' />

      <Header
        shopName={stats?.shopName || 'Cửa hàng của tôi'}
        onBackPress={() => router.replace('/(tabs)/settings')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#e74c3c']}
          />
        }
      >
        <BusinessInsights stats={stats} loading={loading} />

        <TodoList
          todoStats={stats?.todo}
          onItemPress={(target) =>
            router.push(`/seller-orders?filter=${target}` as any)
          }
        />

        {!hasBusinessData && (
          <View style={styles.emptyStateCard}>
            <Ionicons name='storefront-outline' size={48} color='#95a5a6' />
            <Text style={styles.emptyStateTitle}>
              Shop của bạn đang chờ đơn đầu tiên
            </Text>
            <Text style={styles.emptyStateText}>
              Hãy thêm sản phẩm và bật khuyến mãi để bắt đầu có doanh thu ngay
              hôm nay.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => router.push('/seller-products')}
            >
              <Text style={styles.emptyStateButtonText}>
                Thêm sản phẩm ngay
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Campaign Banner */}
        <CampaignCard
          title='Đăng ký Flash Sale mùa hè'
          description='Tăng hiển thị shop lên đến 40% bằng cách tham gia sự kiện flash sale lớn nhất năm.'
          buttonText='Đăng ký ngay'
        />

        <View style={styles.footerSpacing} />
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7FF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  skeletonContainer: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  skeletonHeader: {
    height: 20,
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
  },
  skeletonGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonCard: {
    flex: 1,
    height: 128,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  skeletonPanel: {
    height: 180,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF4B4B',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#7C5CFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyStateCard: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    padding: 32,
    shadowColor: '#1B1530',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(27, 21, 48, 0.03)',
  },
  emptyStateTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#1B1530',
    textAlign: 'center',
  },
  emptyStateText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#A29DBA',
    fontSize: 14,
    lineHeight: 22,
  },
  emptyStateButton: {
    marginTop: 24,
    backgroundColor: '#7C5CFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  footerSpacing: {
    height: 100,
  },
});

export default DashboardScreen;
