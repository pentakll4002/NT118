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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import StatCard from '../components/dashboard/StatCard';

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const { stats, users, shops, loading, refreshing, error, onRefresh, retry } = useAdminDashboard();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Đang tải dữ liệu admin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý hệ thống</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>Thống kê tổng quan</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Doanh thu"
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon="cash-outline"
            color="#2ecc71"
          />
          <StatCard
            title="Đơn hàng"
            value={stats?.totalOrders || 0}
            icon="cart-outline"
            color="#3498db"
          />
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            title="Người dùng"
            value={stats?.totalUsers || 0}
            icon="people-outline"
            color="#9b59b6"
          />
          <StatCard
            title="Cửa hàng"
            value={stats?.totalShops || 0}
            icon="storefront-outline"
            color="#f1c40f"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Người dùng mới nhất</Text>
          <TouchableOpacity onPress={() => router.push('/users' as any)}>
            <Text style={styles.seeAllText}>Tất cả</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.listCard}>
          {users.slice(0, 5).map((user) => (
            <View key={user.id} style={styles.listItem}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{user.username}</Text>
                <Text style={styles.itemSub}>{user.email}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: user.role === 'admin' ? '#e74c3c' : '#3498db' }]}>
                <Text style={styles.badgeText}>{user.role}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cửa hàng mới nhất</Text>
          <TouchableOpacity onPress={() => router.push('/shops' as any)}>
            <Text style={styles.seeAllText}>Tất cả</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.listCard}>
          {shops.slice(0, 5).map((shop) => (
            <View key={shop.id} style={styles.listItem}>
              <View style={[styles.userAvatar, { backgroundColor: '#f39c12' }]}>
                <Ionicons name="storefront" size={16} color="#fff" />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{shop.name}</Text>
                <Text style={styles.itemSub}>{shop.totalProducts} sản phẩm • {shop.rating}★</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: shop.status === 'active' ? '#2ecc71' : '#95a5a6' }]}>
                <Text style={styles.badgeText}>{shop.status}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c3e50',
  },
  scrollContent: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
  },
  itemSub: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    height: 40,
  },
});

export default DashboardScreen;
