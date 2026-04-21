import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  RefreshControl,
  TouchableOpacity
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
  const { stats, loading, refreshing, error, onRefresh, retry } = useSellerDashboard();
  const hasBusinessData = !!stats && (stats.todayOrders > 0 || stats.todayRevenue > 0);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Header shopName="Đang tải..." onBackPress={() => router.replace('/(tabs)/settings')} />
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
        <Header shopName="Lỗi" onBackPress={() => router.replace('/(tabs)/settings')} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <Header 
        shopName={stats?.shopName || "Cửa hàng của tôi"} 
        onBackPress={() => router.replace('/(tabs)/settings')}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#e74c3c']} />
        }
      >
        <BusinessInsights stats={stats} loading={loading} />
        
        <TodoList
          todoStats={stats?.todo}
          onItemPress={(target) => router.push(`/seller-orders?filter=${target}` as any)}
        />

        {!hasBusinessData && (
          <View style={styles.emptyStateCard}>
            <Ionicons name="storefront-outline" size={48} color="#95a5a6" />
            <Text style={styles.emptyStateTitle}>Shop của bạn đang chờ đơn đầu tiên</Text>
            <Text style={styles.emptyStateText}>
              Hãy thêm sản phẩm và bật khuyến mãi để bắt đầu có doanh thu ngay hôm nay.
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={() => router.push('/seller-products')}>
              <Text style={styles.emptyStateButtonText}>Thêm sản phẩm ngay</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Campaign Banner */}
        <CampaignCard 
          title="Đăng ký Flash Sale mùa hè"
          description="Tăng hiển thị shop lên đến 40% bằng cách tham gia sự kiện flash sale lớn nhất năm."
          buttonText="Đăng ký ngay"
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
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  skeletonContainer: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  skeletonHeader: {
    height: 18,
    width: '45%',
    backgroundColor: '#eceff1',
    borderRadius: 8,
    marginTop: 8,
  },
  skeletonGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  skeletonCard: {
    flex: 1,
    height: 100,
    backgroundColor: '#eceff1',
    borderRadius: 14,
  },
  skeletonPanel: {
    height: 160,
    backgroundColor: '#eceff1',
    borderRadius: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyStateCard: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 16,
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
  },
  emptyStateText: {
    marginTop: 6,
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyStateButton: {
    marginTop: 14,
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  footerSpacing: {
    height: 40,
  },
});

export default DashboardScreen;
