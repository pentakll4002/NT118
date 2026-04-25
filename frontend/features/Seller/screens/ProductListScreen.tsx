import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProductHeader from '../components/products/ProductHeader';
import ProductStats from '../components/products/ProductStats';
import ProductFilterTabs from '../components/products/ProductFilterTabs';
import ProductCard from '../components/products/ProductCard';

import {
  mockProducts,
  mockProductStats,
  Product,
  FilterTab,
} from '../data/mockProducts';

import BottomTabBar from '../components/BottomTabBar';


const ProductListScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo<Product[]>(() => {
    let result = mockProducts;

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
  }, [activeTab, searchQuery]);

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

  const handleMore = (product: Product) => {
    import('react-native').then(({ Alert }) => {
      Alert.alert(
        'Tùy chọn',
        `Bạn muốn thực hiện thao tác nào với "${product.name}"?`,
        [
          { text: 'Ẩn sản phẩm', onPress: () => console.log('Hide', product.id) },
          { text: 'Xóa', style: 'destructive', onPress: () => console.log('Delete', product.id) },
          { text: 'Đóng', style: 'cancel' },
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
        totalProducts={mockProductStats.totalProducts}
        liveProducts={mockProductStats.liveProducts}
        soldOutProducts={mockProductStats.soldOutProducts}
        reviewingProducts={mockProductStats.reviewingProducts}
      />
      <ProductFilterTabs activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ProductHeader
        onSearchChange={handleSearch}
        onSettingsPress={() => console.log('Settings pressed')}
        onFilterPress={() => console.log('Filter pressed')}
        onBackPress={() => router.back()}
      />

      {/* Product list */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard product={item} onEdit={handleEdit} onMore={handleMore} />
        )}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

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
