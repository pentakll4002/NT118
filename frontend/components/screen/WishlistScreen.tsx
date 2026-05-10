import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ProductCard, { Product } from '../common/ProductCard';
import { getFavorites, toggleFavorite, FavoriteProduct } from '../../lib/wishlistApi';
import { formatPrice } from '../../lib/productApi';
import { useFocusEffect, useRouter } from 'expo-router';

const WishlistScreen = () => {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchFavorites = async () => {
    try {
      setError(null);
      const res = await getFavorites(1, 100); // Fetch up to 100 favorites
      setFavorites(res.data);
    } catch (err: any) {
      console.log('Failed to fetch favorites:', err);
      // If 401, error will be handled by apiClient generally, but we can set a specific message
      setError('Vui lòng đăng nhập để xem danh sách yêu thích.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchFavorites();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const handleToggleFavorite = async (product: Product) => {
    try {
      const result = await toggleFavorite(Number(product.id));
      if (!result.isFavorited) {
        // Remove from list
        setFavorites((prev) => prev.filter((f) => f.product.id !== product.id));
      }
    } catch (err) {
      console.log('Toggle favorite failed:', err);
    }
  };

  const transformProduct = (fav: FavoriteProduct): Product => ({
    id: fav.product.id,
    name: fav.product.name,
    description: fav.product.description || '',
    price: formatPrice(fav.product.price),
    originalPrice: fav.product.originalPrice ? formatPrice(fav.product.originalPrice) : undefined,
    discount: fav.product.discount > 0 ? `${fav.product.discount}% Off` : undefined,
    rating: fav.product.rating,
    reviews: fav.product.soldQuantity ? `${fav.product.soldQuantity} đã bán` : '0 đã bán', // Or '0 Đánh giá'
    image: fav.product.image ? { uri: fav.product.image } : require('../../assets/images/Group 34010.png'),
  });

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-dislike-outline" size={64} color="#CCC" />
      <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
      <Text style={styles.emptySubtitle}>
        {error || 'Hãy thêm các sản phẩm bạn thích vào đây để dễ dàng xem lại nhé!'}
      </Text>
      {error && (
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login' as any)}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F83758" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách yêu thích</Text>
      </View>

      <FlatList
        key={2}
        data={favorites}
        numColumns={2}
        keyExtractor={(item) => item.favoriteId.toString()}
        renderItem={({ item }) => (
          <ProductCard
            product={transformProduct(item)}
            isMasonry
            isFavorited={true}
            onToggleFavorite={handleToggleFavorite}
            onPress={(p) => router.push(`/product/${p.id}` as any)}
          />
        )}
        contentContainerStyle={favorites.length === 0 ? styles.flexGrow : styles.listContent}
        columnWrapperStyle={favorites.length > 0 ? styles.columnWrapper : undefined}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F83758']} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFDFD',
  },
  flexGrow: {
    flexGrow: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80, // Space for bottom tab
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#F83758',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WishlistScreen;
