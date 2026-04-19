import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../common/Header';
import SearchBar from '../common/SearchBar';
import SearchDetail from './SearchDetail';
import Categories, { Category } from '../common/Categories';
import Banner from '../common/Banner';
import SectionHeader from '../common/SectionHeader';
import ProductCard, { Product } from '../common/ProductCard';
import SpecialOffer from '../common/SpecialOffer';
import PromotionBanner from '../common/PromotionBanner';
import WishlistBanner from '../common/WishlistBanner';
import NewArrivalsCard from '../common/NewArrivalsCard';
import { getProducts, getFeaturedProducts, ProductDTO, formatPrice, formatSold } from '../../lib/productApi';

const categories: Category[] = [
  {
    id: 1,
    name: 'KH Thân Thiết',
    icon: { library: 'MaterialCommunityIcons', name: 'medal-outline', color: '#E8900C', size: 28 },
    bgColor: '#FFF3E0',
  },
  {
    id: 2,
    name: 'Mã Giảm Giá',
    icon: { library: 'MaterialCommunityIcons', name: 'ticket-percent-outline', color: '#E53935', size: 28 },
    bgColor: '#FFEBEE',
  },
  {
    id: 3,
    name: 'Trẻ Em',
    icon: { library: 'MaterialIcons', name: 'child-care', color: '#43A047', size: 28 },
    bgColor: '#E8F5E9',
  },
  {
    id: 4,
    name: 'Thời Trang Nam',
    icon: { library: 'Ionicons', name: 'shirt-outline', color: '#1E88E5', size: 26 },
    bgColor: '#E3F2FD',
  },
  {
    id: 5,
    name: 'Thời Trang Nữ',
    icon: { library: 'MaterialCommunityIcons', name: 'hanger', color: '#E91E8A', size: 28 },
    bgColor: '#FCE4EC',
  },
  {
    id: 6,
    name: 'Quà Tặng',
    icon: { library: 'MaterialCommunityIcons', name: 'gift-outline', color: '#8E24AA', size: 28 },
    bgColor: '#F3E5F5',
  },
];

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
    image: dto.image ? { uri: dto.image } : require('../../assets/images/Group 34010.png'),
  };
}

const HomePage = () => {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newestProducts, setNewestProducts] = useState<Product[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { width } = Dimensions.get('window');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [featured, newest, suggested] = await Promise.all([
        getFeaturedProducts(8),
        getProducts({ page: 1, pageSize: 8, sort: 'newest' }),
        getProducts({ page: 1, pageSize: 6, sort: 'popular' }),
      ]);
      setFeaturedProducts(featured.map(toCardProduct));
      setNewestProducts(newest.data.map(toCardProduct));
      setSuggestedProducts(suggested.data.map(toCardProduct));
    } catch (err) {
      console.log('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}` as any);
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header onMessagePress={() => router.push('/chat')} />

        <TouchableOpacity onPress={() => setIsSearchVisible(true)} activeOpacity={0.9}>
          <View pointerEvents="none">
            <SearchBar
              placeholder="Bạn đang tìm gì..."
              editable={false}
            />
          </View>
        </TouchableOpacity>

        <Categories categories={categories} />

        <Banner
          title="50-40% OFF"
          subtitle="Now in (product)"
          detail="All colours"
        />

        <SectionHeader
          title="Deal of the Day"
          timerText="22h 55m 20s remaining"
          isBlueVariant={true}
          onViewAllPress={() => { }}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#F83758" style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, marginTop: 12 }}
          >
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} isHorizontal={true} onPress={handleProductPress} />
            ))}
          </ScrollView>
        )}

        <SpecialOffer
          title="Special Offers"
          description="We make sure you get the offer you need at best prices"
          emoji="😱"
        />

        <PromotionBanner
          title="Tai nghe Chụp Tai"
          subtitle="Từ khoá gợi ý"
          buttonText="Tìm Ngay"
          image={require('../../assets/images/homepage/icons/unsplash_GCDjllzoKLo.svg')}
        />

        <WishlistBanner
          onPress={() => { }}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#F83758" style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, marginTop: 12 }}
          >
            {newestProducts.map((product) => (<ProductCard key={product.id} product={product} isHorizontal={true} onPress={handleProductPress} />
            ))}
          </ScrollView>
        )}

        <NewArrivalsCard
          title="New Arrivals"
          subtitle="Summer' 25 Collections"
          onViewAll={() => { }}
          image={require('../../assets/images/homepage/icons/unsplash_OYYE4g-I5ZQ.svg')}
        />

        <SectionHeader
          title="Quảng cáo"
          subtitle="up to 50% Off"
          backgroundColor="white"
          viewAllText=""
          onViewAllPress={() => { }}
        />

        <SectionHeader
          title="Gợi ý cho bạn"
          onViewAllPress={() => router.push('/search')}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#F83758" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.masonryContainer}>
            <View style={[styles.column, { width: (width - 40) / 2 }]}>
              {suggestedProducts.filter((_, i) => i % 2 === 0).map((product) => (
                <ProductCard key={product.id} product={product} isMasonry={true} onPress={handleProductPress} />
              ))}
            </View>
            <View style={[styles.column, { width: (width - 40) / 2 }]}>
              {suggestedProducts.filter((_, i) => i % 2 !== 0).map((product) => (
                <ProductCard key={product.id} product={product} isMasonry={true} onPress={handleProductPress} />
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <SearchDetail
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 16,
    justifyContent: 'space-between',
  },
  masonryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    justifyContent: 'space-between',
  },
  column: {
    flexDirection: 'column',
  },
});

export default HomePage;


