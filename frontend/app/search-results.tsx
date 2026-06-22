import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CustomSearchHeader from '../components/common/CustomSearchHeader';
import ProductCard, { Product } from '../components/common/ProductCard';
import SearchFilterBar from '../components/common/SearchFilterBar';
import ActiveFilters from '../components/common/ActiveFilters';
import FilterModal from '../components/common/FilterModal';
import { getProducts, formatPrice, formatSold, ProductDTO } from '../lib/productApi';

const { width } = Dimensions.get('window');

// Optimized Memoized Product Item
const ProductItem = React.memo(({ item, onPress }: { item: Product; onPress: (p: Product) => void }) => (
  <ProductCard 
    product={item} 
    onPress={onPress} 
    isMasonry={false}
  />
));

function toCardProduct(dto: ProductDTO): Product {
  const locations = ['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || '',
    price: formatPrice(dto.price),
    originalPrice: dto.originalPrice ? formatPrice(dto.originalPrice) : undefined,
    discount: dto.discount > 0 ? `-${dto.discount}%` : undefined,
    rating: dto.rating,
    reviews: formatSold(dto.soldQuantity),
    image: dto.image ? { uri: dto.image } : require('../assets/images/product/product-1.png'),
    location: locations[Math.floor(Math.random() * locations.length)],
    isMall: dto.id % 3 === 0,
    isFreeShip: dto.id % 2 === 0,
  };
}

export default function SearchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialQuery = Array.isArray(params.q) ? params.q[0] : params.q || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  const [activeTags, setActiveTags] = useState<{id: string, label: string}[]>([]);

  // Sync searchQuery with params.q
  useEffect(() => {
    if (initialQuery !== searchQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Effect to handle search execution on params change
  useEffect(() => {
    executeSearch(initialQuery, 1);
  }, [initialQuery, params.sort, params.categoryId]);

  const executeSearch = async (query: string, pageNum: number = 1) => {
    const sort = Array.isArray(params.sort) ? params.sort[0] : params.sort;
    const categoryId = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId;
    
    try {
      if (pageNum === 1) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const res = await getProducts({ 
        q: query || undefined, 
        sort: sort as any, 
        categoryId: categoryId ? Number(categoryId) : undefined,
        page: pageNum, 
        pageSize: 10 
      });

      const mapped = res.data.map(toCardProduct);
      if (pageNum === 1) {
        setProducts(mapped);
        setTotalCount(res.pagination.total || 5000);
      } else {
        setProducts(prev => [...prev, ...mapped]);
      }
      
      setPage(pageNum);
      setHasMore(res.pagination.page < res.pagination.totalPages);
    } catch (err) {
      console.log('Search failed:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      executeSearch(searchQuery, page + 1);
    }
  };

  const handleProductPress = useCallback((product: Product) => {
    router.push(`/product/${product.id}` as any);
  }, []);

  const handleSortChange = (sort: string) => {
    router.setParams({ sort: sort as any });
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applying filters:', filters);
    // Logic để thêm các tag lọc vào activeTags
    if (filters.services.includes('mall')) {
      if (!activeTags.find(t => t.id === 'mall')) {
        setActiveTags(prev => [...prev, { id: 'mall', label: 'SHOPEE MALL' }]);
      }
    }
    executeSearch(searchQuery, 1);
  };

  const removeTag = (id: string) => {
    setActiveTags(prev => prev.filter(t => t.id !== id));
  };

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductItem item={item} onPress={handleProductPress} />
  ), [handleProductPress]);

  return (
    <SafeAreaView style={styles.container}>
      <CustomSearchHeader 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
        onSubmitEditing={() => executeSearch(searchQuery, 1)}
        onBackPress={() => router.back()}
        autoFocus={false}
      />
      
      <View style={{ flex: 1 }}>
        <SearchFilterBar 
          currentSort={Array.isArray(params.sort) ? params.sort[0] : params.sort}
          onSortChange={handleSortChange} 
          onFilterPress={() => setIsFilterVisible(true)} 
        />
        <ActiveFilters tags={activeTags} onRemoveTag={removeTag} />
        
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#F73658" />
            <Text style={styles.loadingText}>Đang tải kết quả...</Text>
          </View>
        ) : (
          <FlashList data={products}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>KẾT QUẢ TÌM KIẾM</Text>
                <Text style={styles.resultsSubtitle}>
                  Tìm thấy hơn {totalCount.toLocaleString()} sản phẩm phù hợp
                </Text>
              </View>
            }
            ListFooterComponent={
              hasMore ? (
                <TouchableOpacity 
                  style={styles.loadMoreButton} 
                  onPress={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <ActivityIndicator size="small" color="#555" />
                  ) : (
                    <Text style={styles.loadMoreText}>XEM THÊM SẢN PHẨM</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={{ height: 40 }} />
              )
            }
            renderItem={renderItem}
          />
        )}
      </View>

      <FilterModal 
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={handleApplyFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontFamily: 'Montserrat_400Regular' },
  listContainer: { padding: 12, paddingBottom: 40 },
  resultsHeader: { paddingVertical: 16, paddingHorizontal: 4 },
  resultsTitle: { fontSize: 20, fontWeight: '800', color: '#E0E0E0', fontStyle: 'italic', letterSpacing: 1 },
  resultsSubtitle: { fontSize: 13, color: '#666', marginTop: 4, fontFamily: 'Montserrat_400Regular' },
  row: { justifyContent: 'space-between' },
  loadMoreButton: { borderWidth: 1, borderColor: '#EEE', paddingVertical: 12, marginHorizontal: 12, borderRadius: 4, alignItems: 'center', marginTop: 20, marginBottom: 40, backgroundColor: 'white' },
  loadMoreText: { fontSize: 14, fontWeight: '700', color: '#333', letterSpacing: 0.5 },
});
