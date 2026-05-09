import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProductHeader from '../components/products/ProductHeader';
import ProductStats from '../components/products/ProductStats';
import ProductFilterTabs from '../components/products/ProductFilterTabs';
import ProductCard from '../components/products/ProductCard';
import { sellerApi, SellerProduct } from '../../../lib/sellerApi';

import BottomTabBar from '../components/BottomTabBar';

// Map backend status to display status
type DisplayStatus = 'live' | 'sold_out' | 'reviewing';
export type FilterTab = 'all' | 'live' | 'sold_out' | 'reviewing';

// Product type compatible with ProductCard
export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  status: DisplayStatus;
}

function mapBackendProduct(p: SellerProduct): Product {
  let status: DisplayStatus = 'live';
  if (p.stockQuantity <= 0 || p.status === 'out_of_stock') {
    status = 'sold_out';
  } else if (p.status === 'inactive') {
    status = 'reviewing';
  }
  // active -> live
  return {
    id: String(p.id),
    name: p.name,
    image: p.mainImageUrl || '',
    price: Number(p.price),
    stock: p.stockQuantity,
    status,
  };
}

const ProductListScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await sellerApi.getProducts();
      setProducts(data.map(mapBackendProduct));
    } catch (err: unknown) {
      console.error('Error fetching seller products:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = useCallback(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  // Compute stats from real data
  const productStats = useMemo(() => ({
    totalProducts: products.length,
    liveProducts: products.filter((p) => p.status === 'live').length,
    soldOutProducts: products.filter((p) => p.status === 'sold_out').length,
    reviewingProducts: products.filter((p) => p.status === 'reviewing').length,
  }), [products]);

  const filteredProducts = useMemo<Product[]>(() => {
    let result = products;

    //tab
    if (activeTab !== 'all') {
      result = result.filter((p) => p.status === activeTab);
    }

    //search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    return result;
  }, [products, activeTab, searchQuery]);

  // ——— Handlers ———
  const handleSearch = (text: string) => setSearchQuery(text);
  const handleTabChange = (tab: FilterTab) => setActiveTab(tab);
  
  const handleEdit = (product: Product) => {
    // Navigate to add product screen with ID to signify edit mode
    router.push({
      pathname: '/seller-add-product',
      params: { id: product.id }
    } as any);
  };

  const handleHide = async (product: Product) => {
    try {
      const newStatus = product.status === 'reviewing' ? 'active' : 'inactive';
      await sellerApi.updateProductStatus(Number(product.id), newStatus);
      await fetchProducts();
    } catch (err) {
      console.error('Error hiding product:', err);
      import('react-native').then(({ Alert }) => {
        Alert.alert('Lỗi', 'Không thể cập nhật trạng thái sản phẩm.');
      });
    }
  };

  const handleDelete = (product: Product) => {
    import('react-native').then(({ Alert }) => {
      Alert.alert(
        'Xác nhận xóa',
        `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}" không? Thao tác này không thể hoàn tác.`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              try {
                await sellerApi.deleteProduct(Number(product.id));
                await fetchProducts();
              } catch (err) {
                console.error('Error deleting product:', err);
                Alert.alert('Lỗi', 'Không thể xóa sản phẩm.');
              }
            },
          },
        ]
      );
    });
  };

  const handleAddProduct = () => {
    router.push('/seller-add-product' as any);
  };

  // ——— List header (Stats + Tabs) ———
  const renderListHeader = () => (
    <View>
      <ProductStats
        totalProducts={productStats.totalProducts}
        liveProducts={productStats.liveProducts}
        soldOutProducts={productStats.soldOutProducts}
        reviewingProducts={productStats.reviewingProducts}
      />
      <ProductFilterTabs activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );

  // ——— Empty state ———
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={48} color="#95a5a6" />
        <Text style={styles.emptyTitle}>
          {error ? 'Không thể tải sản phẩm' : 'Chưa có sản phẩm nào'}
        </Text>
        <Text style={styles.emptyText}>
          {error || 'Hãy thêm sản phẩm đầu tiên cho cửa hàng của bạn.'}
        </Text>
        {error ? (
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchProducts()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.addFirstButton} onPress={handleAddProduct}>
            <Text style={styles.addFirstText}>Thêm sản phẩm</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ProductHeader
        onSearchChange={handleSearch}
        onSettingsPress={() => console.log('Settings pressed')}
        onFilterPress={() => console.log('Filter pressed')}
        onBackPress={() => router.back()}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          {renderListHeader()}
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onEdit={handleEdit}
              onHide={handleHide}
              onDelete={handleDelete}
            />
          )}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />
          }
        />
      )}

      {/* FAB — Add product */}
      <TouchableOpacity style={styles.fab} onPress={handleAddProduct} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Bottom tabs */}
      <BottomTabBar />
    </SafeAreaView>
  );
};

// ============================
// Styles
// ============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  addFirstButton: {
    marginTop: 16,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    // shadow iOS
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    // elevation Android
    elevation: 6,
  },
});

export default ProductListScreen;
