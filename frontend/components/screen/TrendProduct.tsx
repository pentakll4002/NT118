import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';
import SearchBar from '../common/SearchBar';
import VoiceAssistantModal from '../common/VoiceAssistantModal';
import ProductCard, { Product } from '../common/ProductCard';
import { getProducts, ProductDTO, formatPrice, formatSold } from '../../lib/productApi';
import { toggleFavorite, getFavorites } from '../../lib/wishlistApi';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';

/** Transform API product to ProductCard format */
function toCardProduct(dto: ProductDTO): Product {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || '',
    price: formatPrice(dto.price),
    originalPrice: dto.originalPrice ? formatPrice(dto.originalPrice) : undefined,
    discount: dto.discount > 0 ? `${dto.discount}% Off` : undefined,
    rating: dto.rating,
    reviews: formatSold(dto.soldQuantity),
    image: dto.image ? { uri: dto.image } : require('../../assets/images/product/product-1.png'),
  };
}

const TrendProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [sort, setSort] = useState<SortOption>('popular');
  const [favoriteIds, setFavoriteIds] = useState<Set<number | string>>(new Set());
  const [isVoiceVisible, setIsVoiceVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadProducts();
    loadFavorites();
  }, [sort]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts({ page: 1, pageSize: 20, sort });
      setProducts(res.data.map(toCardProduct));
      setTotalCount(res.pagination.total);
    } catch (err) {
      console.log('Failed to load trend products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await getFavorites(1, 100);
      const ids = new Set<number | string>(res.data.map((f) => f.product.id));
      setFavoriteIds(ids);
    } catch {
      // User might not be logged in — ignore
    }
  };

  const handleToggleFavorite = useCallback(async (product: Product) => {
    try {
      const result = await toggleFavorite(Number(product.id));
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (result.isFavorited) {
          next.add(product.id);
        } else {
          next.delete(product.id);
        }
        return next;
      });
    } catch (err) {
      console.log('Toggle favorite failed:', err);
    }
  }, []);

  const handleSort = (newSort: SortOption) => {
    if (sort !== newSort) setSort(newSort);
  };

  const leftCol = products.filter((_, i) => i % 2 === 0);
  const rightCol = products.filter((_, i) => i % 2 !== 0);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <SearchBar onVoicePress={() => setIsVoiceVisible(true)} />
      
      <View style={styles.headerRow}>
        <Text style={styles.productCount}>
          {totalCount > 0 ? `${totalCount.toLocaleString('vi-VN')}+ Sản phẩm` : 'Đang tải...'}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, sort === 'popular' && styles.actionButtonActive]}
            onPress={() => handleSort('popular')}
          >
            <Text style={[styles.actionText, sort === 'popular' && styles.actionTextActive]}>Phổ biến</Text>
            <Ionicons name="trending-up" size={14} color={sort === 'popular' ? '#F83758' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, sort === 'price_asc' && styles.actionButtonActive]}
            onPress={() => handleSort(sort === 'price_asc' ? 'price_desc' : 'price_asc')}
          >
            <Text style={[styles.actionText, (sort === 'price_asc' || sort === 'price_desc') && styles.actionTextActive]}>Giá</Text>
            <Ionicons
              name={sort === 'price_desc' ? 'arrow-down' : 'arrow-up'}
              size={14}
              color={(sort === 'price_asc' || sort === 'price_desc') ? '#F83758' : 'black'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, sort === 'newest' && styles.actionButtonActive]}
            onPress={() => handleSort('newest')}
          >
            <Text style={[styles.actionText, sort === 'newest' && styles.actionTextActive]}>Mới</Text>
            <Ionicons name="time-outline" size={14} color={sort === 'newest' ? '#F83758' : 'black'} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F83758" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="cube-outline" size={48} color="#CCC" />
          <Text style={styles.loadingText}>Không tìm thấy sản phẩm</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.masonryContainer}>
          <View style={styles.column}>
            {leftCol.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isMasonry
                isFavorited={favoriteIds.has(product.id)}
                onToggleFavorite={handleToggleFavorite}
                onPress={(p) => router.push(`/product/${p.id}` as any)}
              />
            ))}
          </View>
          <View style={styles.column}>
            {rightCol.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isMasonry
                isFavorited={favoriteIds.has(product.id)}
                onToggleFavorite={handleToggleFavorite}
                onPress={(p) => router.push(`/product/${p.id}` as any)}
              />
            ))}
          </View>
        </ScrollView>
      )}
      <VoiceAssistantModal visible={isVoiceVisible} onClose={() => setIsVoiceVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  productCount: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  actionButtonActive: {
    borderWidth: 1,
    borderColor: '#F83758',
  },
  actionText: {
    fontSize: 11,
    fontFamily: 'Montserrat_400Regular',
    color: '#000',
  },
  actionTextActive: {
    color: '#F83758',
    fontWeight: '600',
  },
  masonryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 80,
    justifyContent: 'space-between',
  },
  column: {
    width: (width - 40) / 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    color: '#888',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
});

export default TrendProduct;
