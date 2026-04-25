import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, AdminShopDTO } from '@/lib/adminApi';
import { useRouter } from 'expo-router';

const ShopManagementScreen: React.FC = () => {
  const router = useRouter();
  const [shops, setShops] = useState<AdminShopDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchShops = useCallback(async () => {
    try {
      const data = await adminApi.getShops();
      setShops(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách cửa hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchShops();
  }, [fetchShops]);

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4392F9" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Cửa hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên cửa hàng..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.listCard}>
          {filteredShops.map((shop) => (
            <View key={shop.id} style={styles.listItem}>
              <View style={[styles.shopIcon, { backgroundColor: '#f39c1220' }]}>
                <Ionicons name="storefront" size={20} color="#f39c12" />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{shop.name}</Text>
                <Text style={styles.itemSub}>{shop.totalProducts} sản phẩm • {shop.rating}★</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.itemDate}>Từ: {new Date(shop.createdAt).toLocaleDateString('vi-VN')}</Text>
                  {shop.isVerified && (
                    <View style={styles.verifiedTag}>
                      <Ionicons name="checkmark-circle" size={12} color="#4392F9" />
                      <Text style={styles.verifiedText}>Đã xác minh</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: shop.status === 'active' ? '#2ecc71' : '#94a3b8' }]}>
                <Text style={styles.badgeText}>{shop.status}</Text>
              </View>
            </View>
          ))}
          {filteredShops.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Không tìm thấy cửa hàng nào</Text>
            </View>
          )}
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 45,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  shopIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    color: '#64748b',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  itemDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedText: {
    fontSize: 10,
    color: '#4392F9',
    fontWeight: '600',
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7f8c8d',
  },
});

export default ShopManagementScreen;
