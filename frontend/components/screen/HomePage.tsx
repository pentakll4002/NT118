import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../common/Header';
import SearchBar from '../common/SearchBar';
import Categories, { Category } from '../common/Categories';
import Banner from '../common/Banner';
import SectionHeader from '../common/SectionHeader';
import ProductCard, { Product } from '../common/ProductCard';
import SpecialOffer from '../common/SpecialOffer';
import PromotionBanner from '../common/PromotionBanner';
import WishlistBanner from '../common/WishlistBanner';
import NewArrivalsCard from '../common/NewArrivalsCard';

const categories: Category[] = [
  { id: 1, name: 'KH Thân Thiết', image: require('../../assets/images/homepage/icons/Ellipse 4.svg') },
  { id: 2, name: 'Mã Giảm Giá', image: require('../../assets/images/homepage/icons/Ellipse 4.svg') },
  { id: 3, name: 'Trẻ Em', image: require('../../assets/images/homepage/icons/Ellipse 4.svg') },
  { id: 4, name: 'Thời Trang Nam', image: require('../../assets/images/homepage/icons/Ellipse 4.svg') },
  { id: 5, name: 'Thời Trang Nữ', image: require('../../assets/images/homepage/icons/Ellipse 4.svg') },
  { id: 6, name: 'Gifts', image: require('../../assets/images/homepage/icons/Ellipse 4.svg') },
];

const products: Product[] = [
  {
    id: 1,
    name: 'Women Printed Kurta',
    description: 'Neque porro quisquam est qui dolorem ipsum quia',
    price: '₹1500',
    originalPrice: '₹2499',
    discount: '40%Off',
    rating: 4.5,
    reviews: '56890',
    image: require('../../assets/images/homepage/icons/unsplash_GCDjllzoKLo.svg'),
  },
  {
    id: 2,
    name: 'HRX by Hrithik Roshan',
    description: 'Neque porro quisquam est qui dolorem ipsum quia',
    price: '₹2499',
    originalPrice: '₹4999',
    discount: '50%Off',
    rating: 4.5,
    reviews: '344567',
    image: require('../../assets/images/homepage/icons/unsplash_OYYE4g-I5ZQ.svg'),
  },
  {
    id: 3,
    name: 'Philips BHH880/10',
    description: 'Hair Straightening Brush With Keratin Infused Bristles (Black).',
    price: '₹999',
    originalPrice: '₹1999',
    discount: '50%Off',
    rating: 4.5,
    reviews: '646776',
    image: require('../../assets/images/homepage/icons/unsplash__3Q3tsJ01nc.svg'),
  },
  {
    id: 4,
    name: 'TITAN Men Watch- 1806N',
    description: 'This Titan watch in Black color is I wanted to buy for a long time',
    price: '₹1500',
    originalPrice: '₹3500',
    discount: '60%Off',
    rating: 4.5,
    reviews: '15007',
    image: require('../../assets/images/homepage/icons/unsplash_xPJYL0l5Ii8.svg'),
  },
];

const HomePage = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        
        <SearchBar />

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
          onViewAllPress={() => {}}
        />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 16, marginTop: 12 }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isHorizontal={true} />
          ))}
        </ScrollView>

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
          title="Danh sách yêu thích"
          onPress={() => {}}
        />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 16, marginTop: 12 }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isHorizontal={true} />
          ))}
        </ScrollView>

        <NewArrivalsCard 
          title="New Arrivals"
          subtitle="Summer’ 25 Collections"
          onViewAll={() => {}}
          image={require('../../assets/images/homepage/icons/unsplash_OYYE4g-I5ZQ.svg')}
        />

        <SectionHeader 
          title="Quảng cáo"
          subtitle="up to 50% Off"
          backgroundColor="white"
          viewAllText=""
          onViewAllPress={() => {}}
        />

        <View style={{ height: 100 }} />
      </ScrollView>
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
});

export default HomePage;
