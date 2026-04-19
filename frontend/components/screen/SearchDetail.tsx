import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, ScrollView, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import CustomSearchHeader from '../common/CustomSearchHeader';
import SuggestionCard from '../common/SuggestionCard';
import ProductCard, { Product } from '../common/ProductCard';
import { getProducts, formatPrice, formatSold, ProductDTO } from '../../lib/productApi';

const { width } = Dimensions.get('window');

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
    image: dto.image ? { uri: dto.image } : require('../../assets/images/Group 34010.png'),
  };
}

interface SearchDetailProps {
  visible: boolean;
  onClose: () => void;
}

export default function SearchDetail({ visible, onClose }: SearchDetailProps) {
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  // Load suggestions initially when opened
  useEffect(() => {
    if (visible) {
      loadSuggestions();
    } else {
      // clear search context when closed
      setSearchQuery('');
      setProducts([]);
    }
  }, [visible]);

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const res = await getProducts({ page: 1, pageSize: 12, sort: 'popular' });
      setSuggestedProducts(res.data.map(toCardProduct));
    } catch (err) {
      console.log('Suggestions failed:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const executeSearch = async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }
    try {
      setLoading(true);
      const res = await getProducts({ q: query, page: 1, pageSize: 20 });
      setProducts(res.data.map(toCardProduct));
    } catch (err) {
      console.log('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Simple debounce
  useEffect(() => {
    if (!visible) return;
    const timeoutId = setTimeout(() => {
      executeSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, visible]);

  const handleTextChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      executeSearch(searchQuery.trim());
    }
  };

  const handleProductPress = (product: Product) => {
    onClose();
    router.push(`/product/${product.id}` as any);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <CustomSearchHeader 
          value={searchQuery} 
          onChangeText={handleTextChange} 
          onSubmitEditing={handleSearchSubmit}
          onBackPress={onClose}
          autoFocus={visible}
        />
        
        {loading && searchQuery.trim() ? (
          <ActivityIndicator size="large" color="#4392F9" style={styles.loader} />
        ) : searchQuery.trim() && products.length > 0 ? (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ProductCard 
                product={item} 
                onPress={handleProductPress} 
                isMasonry={false}
              />
            )}
          />
        ) : searchQuery.trim() && products.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào phù hợp cho "{searchQuery}".</Text>
          </View>
        ) : null}

        {!searchQuery.trim() && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.suggestionContainer}>
            <Text style={styles.suggestionTitle}>Gợi ý tìm kiếm</Text>
            {loadingSuggestions ? (
              <ActivityIndicator size="small" color="#4392F9" style={styles.loader} />
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  loader: {
    marginTop: 40,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#676767',
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
  },
  suggestionContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: '#FDFDFD',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 16,
    color: '#333',
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
});
