import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  Dimensions, 
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../common/Header';
import SearchBar from '../common/SearchBar';
import Banner from '../common/Banner';
import SearchDetail from '../screen/SearchDetail';
import VoiceAssistantModal from '../common/VoiceAssistantModal';
import SectionHeader from '../common/SectionHeader';
import ProductCard, { Product } from '../common/ProductCard';
import WishlistBanner from '../common/WishlistBanner';
import Skeleton from '../common/Skeleton';
import { getProducts, getFeaturedProducts, ProductDTO, formatPrice, formatSold } from '../../lib/productApi';
import { getCategories, CategoryDTO } from '../../lib/categoryApi';
import { userApi, UserProfileDTO } from '../../lib/userApi';



function toCardProduct(dto: ProductDTO): Product {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || '',
    price: formatPrice(dto.price),
    originalPrice: dto.originalPrice ? formatPrice(dto.originalPrice) : undefined,
    discount: dto.discount > 0 ? `Giảm ${dto.discount}%` : undefined,
    rating: dto.rating,
    reviews: formatSold(dto.soldQuantity),
    image: dto.image ? { uri: dto.image } : require('../../assets/images/product/product-1.png'),
  };
}

const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfileDTO | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newestProducts, setNewestProducts] = useState<Product[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isVoiceVisible, setIsVoiceVisible] = useState(false);
  
  // Pagination for suggested products
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { width } = Dimensions.get('window');
  const [apiCategories, setApiCategories] = useState<CategoryDTO[]>([]);

  // Countdown timer
  const [countdown, setCountdown] = useState(10520); // ~2h55m20s in seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev <= 0 ? 10520 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const formatCountdown = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `Kết thúc sau ${h}:${m}:${sec}`;
  };

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const banners = [
    {
      title: "Ưu Đãi Đặc Biệt",
      subtitle: "Giá tốt nhất thị trường",
      detail: "Cam kết hoàn tiền nếu tìm thấy nơi rẻ hơn",
      image: require('../../assets/images/banner/banner-1.png'),
      onPress: () => router.push('/search-results?sort=popular' as any),
    },
    {
      title: "Siêu Sale Mùa Hè",
      subtitle: "Giảm giá lên đến 50%",
      detail: "Áp dụng cho toàn bộ ngành hàng điện tử & thời trang",
      image: require('../../assets/images/banner/banner-2.png'),
      onPress: () => router.push('/search-results?sort=newest' as any),
    }
  ];

  const loadData = useCallback(async () => {
    try {
      const [profile, flashSale, newest, suggested, favs, cats] = await Promise.all([
        userApi.getProfile().catch(() => null),
        getProducts({ page: 1, pageSize: 6, isFlashSale: true }),
        getProducts({ page: 1, pageSize: 6, sort: 'newest' }),
        getProducts({ page: 1, pageSize: 6, sort: 'popular' }),
        import('../../lib/wishlistApi').then(m => m.getFavorites().catch(() => ({ data: [] } as any))),
        getCategories()
      ]);

      if (profile) setUser(profile);
      const flashSaleData = flashSale.data.length > 0 ? flashSale.data : suggested.data;
      setFeaturedProducts(flashSaleData.map(toCardProduct));
      setNewestProducts(newest.data.map(toCardProduct));
      setSuggestedProducts(suggested.data.map(toCardProduct));
      setApiCategories(cats);
      setPage(1);
      setHasMore(suggested.pagination.page < suggested.pagination.totalPages);

      if (favs && favs.data) {
        setFavoriteIds(new Set(favs.data.map((f: any) => f.product.id)));
      }
    } catch (err) {
      console.log('Failed to load home data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadMoreSuggested = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await getProducts({ page: nextPage, pageSize: 6, sort: 'popular' });
      
      if (res.data.length > 0) {
        setSuggestedProducts(prev => [...prev, ...res.data.map(toCardProduct)]);
        setPage(nextPage);
        setHasMore(res.pagination.page < res.pagination.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.log('Load more failed', e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Check for pagination in horizontal banner scroll
    // This is handled via onMomentumScrollEnd for the banner ScrollView
    
    // Check for load more in vertical scroll
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
    
    if (isCloseToBottom) {
      loadMoreSuggested();
    }
  };

  const handleBannerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveBannerIndex(index);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSort = () => {
    const options = [
      { text: 'Mới nhất', value: 'newest' },
      { text: 'Giá thấp đến cao', value: 'price_asc' },
      { text: 'Giá cao đến thấp', value: 'price_desc' },
      { text: 'Phổ biến nhất', value: 'popular' },
      { text: 'Hủy', value: 'cancel', style: 'cancel' as const },
    ];

    require('react-native').Alert.alert(
      'Sắp xếp theo',
      'Chọn tiêu chí sắp xếp cho sản phẩm',
      options.map(opt => ({
        text: opt.text,
        style: opt.style,
        onPress: () => {
          if (opt.value !== 'cancel') {
            router.push(`/search-results?sort=${opt.value}` as any);
          }
        }
      }))
    );
  };

  const handleFilter = () => {
    const catOptions = apiCategories.length > 0
      ? [
          { text: 'Tất cả danh mục', id: null },
          ...apiCategories.slice(0, 6).map(c => ({ text: c.name, id: c.id })),
          { text: 'Hủy', id: 'cancel', style: 'cancel' as const },
        ]
      : [
          { text: 'Tất cả danh mục', id: null },
          { text: 'Hủy', id: 'cancel', style: 'cancel' as const },
        ];

    require('react-native').Alert.alert(
      'Lọc theo danh mục',
      'Chọn danh mục bạn muốn tìm kiếm',
      catOptions.map(opt => ({
        text: opt.text,
        style: (opt as any).style,
        onPress: () => {
          if (opt.id !== 'cancel') {
            const url = opt.id ? `/search-results?categoryId=${opt.id}` : '/search-results';
            router.push(url as any);
          }
        }
      }))
    );
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}` as any);
  };

  const handleToggleFavorite = async (product: Product) => {
    try {
      const pid = Number(product.id);
      const { toggleFavorite } = await import('../../lib/wishlistApi');
      await toggleFavorite(pid);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (next.has(pid)) next.delete(pid);
        else next.add(pid);
        return next;
      });
    } catch (e) {
      console.log('Failed to toggle favorite', e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header 
        userName={user?.name} 
        avatarUrl={user?.avatarUrl}
        onMessagePress={() => router.push('/chat')}
        onProfilePress={() => router.push('/(tabs)/settings')}
        onMenuPress={() => router.push('/(tabs)/notification')}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F73658']} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={{ zIndex: 999, elevation: 10 }}>
          <SearchBar
            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            onPress={() => setIsSearchVisible(true)}
            onVoicePress={() => setIsVoiceVisible(true)}
          />
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleBannerScroll}
          style={styles.bannerCarousel}
        >
          {banners.map((b, i) => (
            <View key={i} style={{ width: width }}>
              <Banner
                title={b.title}
                subtitle={b.subtitle}
                detail={b.detail}
                image={b.image}
                activeDotIndex={activeBannerIndex}
                totalDots={banners.length}
                onPress={b.onPress}
              />
            </View>
          ))}
        </ScrollView>

        {/* Categories section removed as requested */}

        <SectionHeader
          title="Deal Chớp Nhoáng"
          timerText={formatCountdown(countdown)}
          isBlueVariant={false}
          onViewAllPress={() => router.push('/search-results?sort=popular' as any)}
        />

        {loading && !refreshing ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {[1, 2, 3].map(i => (
              <View key={i} style={{ marginRight: 16 }}>
                <Skeleton width={180} height={240} borderRadius={16} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {featuredProducts.map((product, index) => (
              <ProductCard 
                key={`featured-${product.id}-${index}`} 
                product={product} 
                isHorizontal={true} 
                onPress={handleProductPress} 
                isFavorited={favoriteIds.has(Number(product.id))} 
                onToggleFavorite={handleToggleFavorite} 
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionDivider} />

        <SectionHeader
          title="Sản phẩm mới nhất"
          onViewAllPress={() => router.push('/search-results?sort=newest' as any)}
        />

        {loading && !refreshing ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {[1, 2, 3].map(i => (
              <View key={i} style={{ marginRight: 16 }}>
                <Skeleton width={180} height={240} borderRadius={16} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {newestProducts.map((product, index) => (
              <ProductCard 
                key={`newest-${product.id}-${index}`} 
                product={product} 
                isHorizontal={true} 
                onPress={handleProductPress} 
                isFavorited={favoriteIds.has(Number(product.id))} 
                onToggleFavorite={handleToggleFavorite} 
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionDivider} />

        <WishlistBanner onPress={() => router.push('/(tabs)/wishlist')} />

        <SectionHeader
          title="Gợi ý dành cho bạn"
        />

        {loading && !refreshing ? (
          <View style={styles.masonryContainer}>
            <View style={[styles.column, { width: (width - 40) / 2 }]}>
              <Skeleton width="100%" height={260} borderRadius={16} style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height={220} borderRadius={16} style={{ marginBottom: 16 }} />
            </View>
            <View style={[styles.column, { width: (width - 40) / 2 }]}>
              <Skeleton width="100%" height={220} borderRadius={16} style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height={260} borderRadius={16} style={{ marginBottom: 16 }} />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.masonryContainer}>
              <View style={[styles.column, { width: (width - 40) / 2 }]}>
                {suggestedProducts.filter((_, i) => i % 2 === 0).map((product, index) => (
                  <ProductCard key={`suggested-l-${product.id}-${index}`} product={product} isMasonry={true} onPress={handleProductPress} isFavorited={favoriteIds.has(Number(product.id))} onToggleFavorite={handleToggleFavorite} />
                ))}
              </View>
              <View style={[styles.column, { width: (width - 40) / 2 }]}>
                {suggestedProducts.filter((_, i) => i % 2 !== 0).map((product, index) => (
                  <ProductCard key={`suggested-r-${product.id}-${index}`} product={product} isMasonry={true} onPress={handleProductPress} isFavorited={favoriteIds.has(Number(product.id))} onToggleFavorite={handleToggleFavorite} />
                ))}
              </View>
            </View>
            {loadingMore && (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator color="#F73658" />
              </View>
            )}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <SearchDetail
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
      />

      <VoiceAssistantModal
        visible={isVoiceVisible}
        onClose={() => setIsVoiceVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bannerCarousel: {
    marginTop: 8,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#F8F9FA',
    marginVertical: 16,
  },
  horizontalList: {
    paddingHorizontal: 16,
    marginTop: 4,
    paddingBottom: 8,
  },
  masonryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  column: {
    flexDirection: 'column',
  },
});

export default HomePage;
