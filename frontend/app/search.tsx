import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomSearchHeader from '../components/common/CustomSearchHeader';
import SuggestionCard from '../components/common/SuggestionCard';
import ProductCard, { Product } from '../components/common/ProductCard';
import SearchFilterBar from '../components/common/SearchFilterBar';
import ActiveFilters from '../components/common/ActiveFilters';
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
  // Giả lập một số badge và địa điểm để giao diện giống mẫu Shopee trong ảnh
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

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialQuery = Array.isArray(params.q) ? params.q[0] : params.q || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [history, setHistory] = useState<string[]>(['Laptop gaming', 'Tai nghe Sony', 'Bàn phím cơ']);
  
  const [activeTags, setActiveTags] = useState([
    { id: 'mall', label: 'SHOPEE MALL' },
    { id: 'location', label: 'HÀ NỘI' },
    { id: 'price_limit', label: 'GIÁ DƯỚI 500K' },
  ]);

  // Load suggestions initially
  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const [popularRes, newestRes] = await Promise.all([
        getProducts({ page: 1, pageSize: 12, sort: 'popular' }),
        getProducts({ page: 1, pageSize: 12, sort: 'newest' }),
      ]);

      const merged = [...newestRes.data, ...popularRes.data];
      const deduped = merged.filter((item, index, arr) => arr.findIndex(x => x.id === item.id) === index);
      setSuggestedProducts(deduped.slice(0, 12).map(toCardProduct));
    } catch (err) {
      console.log('Suggestions failed:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    if (initialQuery || params.sort || params.categoryId) {
      executeSearch(initialQuery, 1);
    }
  }, [initialQuery, params.sort, params.categoryId]);

  const executeSearch = async (query: string, pageNum: number = 1) => {
    const sort = Array.isArray(params.sort) ? params.sort[0] : params.sort;
    const categoryId = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId;

    if (!query.trim() && !sort && !categoryId) {
      setProducts([]);
      return;
    }
    
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

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
        setTotalCount(res.pagination.total || 5000); // Giả lập số lượng lớn nếu API trả về 0
      } else {
        setProducts(prev => [...prev, ...mapped]);
      }
      
      setPage(pageNum);
      setHasMore(res.pagination.page < res.pagination.totalPages);

      if (query.trim() && pageNum === 1 && !history.includes(query.trim())) {
        setHistory(prev => [query.trim(), ...prev.slice(0, 4)]);
      }
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
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#F73658" />
          <Text style={styles.loadingText}>Đang tải kết quả...</Text>
        </View>
      ) : searchQuery.trim() || params.sort || params.categoryId ? (
        <View style={{ flex: 1 }}>
          <SearchFilterBar onSortChange={handleSortChange} onFilterPress={() => {}} />
          <ActiveFilters tags={activeTags} onRemoveTag={removeTag} />
          
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
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.suggestionContainer}>
          {history.length > 0 && (
            <View style={styles.historySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
                <TouchableOpacity onPress={() => setHistory([])}>
                  <Text style={styles.clearText}>Xóa tất cả</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.historyTags}>
                {history.map((item, index) => (
                  <TouchableOpacity key={index} style={styles.tag} onPress={() => setSearchQuery(item)}>
                    <Text style={styles.tagText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <Text style={styles.suggestionTitle}>Gợi ý cho bạn</Text>
          {loadingSuggestions ? (
             <ActivityIndicator size="small" color="#F73658" style={styles.loader} />
          ) : (
             <View style={styles.masonryContainer}>
               <View style={[styles.column, { width: (width - 48) / 2 }]}>
                 {suggestedProducts.filter((_, i) => i % 2 === 0).map((product) => (
                   <SuggestionCard key={product.id} product={product} onPress={handleProductPress} />
                 ))}
               </View>
               <View style={[styles.column, { width: (width - 48) / 2 }]}>
                 {suggestedProducts.filter((_, i) => i % 2 !== 0).map((product) => (
                   <SuggestionCard key={product.id} product={product} onPress={handleProductPress} />
                 ))}
               </View>
             </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  loader: {
    marginTop: 20,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 40,
  },
  resultsHeader: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E0E0E0', // Màu bạc xám giống ảnh
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  resultsSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  suggestionContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  historySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
    color: '#1A1A1A',
  },
  clearText: {
    fontSize: 12,
    color: '#F73658',
    fontFamily: 'Montserrat_500Medium',
  },
  historyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: '#444',
    fontFamily: 'Montserrat_400Regular',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flexDirection: 'column',
  },
  row: {
    justifyContent: 'space-between',
  },
  loadMoreButton: {
    borderWidth: 1,
    borderColor: '#EEE',
    paddingVertical: 12,
    marginHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: 'white',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
  },
});
