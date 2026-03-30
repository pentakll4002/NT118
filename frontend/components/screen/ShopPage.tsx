import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import SizeSelector from '../common/SizeSelector';
import ActionButtons from '../common/ActionButtons';
import ProductCard, { Product } from '../common/ProductCard';

const { width } = Dimensions.get('window');

const ShopPage = () => {
  const [selectedSize, setSelectedSize] = React.useState('7 UK');

  const relatedProducts: Product[] = [
    {
      id: 1,
      name: 'NIke Sneakers',
      description: 'Nike Air Jordan Retro 1 Low Mystic Black',
      price: '₹1,900',
      rating: 4.5,
      reviews: '46,890',
      image: require('../../assets/images/shop-page/img/unsplash_76w_eDO1u1E.svg'),
    },
    {
      id: 2,
      name: 'NIke Sneakers',
      description: 'Mid Peach Mocha Shoes For Man White Black Pink S...',
      price: '₹1,900',
      rating: 4.5,
      reviews: '2,56,890',
      image: require('../../assets/images/shop-page/img/unsplash_mHUk4Se7peY.svg'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Navigation */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartIcon}>
            <Feather name="shopping-cart" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* Product Image Carousel Placeholder */}
        <View style={styles.imageContainer}>
          <View style={styles.mainImagePlaceholder}>
            <TouchableOpacity style={styles.nextButton}>
              <Ionicons name="chevron-forward" size={24} color="black" />
            </TouchableOpacity>
          </View>
          {/* Pagination dots */}
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Size Selection */}
        <SizeSelector
          sizes={['6 UK', '7 UK', '8 UK', '9 UK', '10 UK']}
          selectedSize={selectedSize}
          onSizeSelect={setSelectedSize}
        />

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>NIke Sneakers</Text>
          <Text style={styles.productSubtitle}>Vision Alta Men’s Shoes Size (All Colours)</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4].map((i) => (
                <Ionicons key={i} name="star" size={16} color="#EDB310" />
              ))}
              <Ionicons name="star-half" size={16} color="#BBBBBB" />
            </View>
            <Text style={styles.reviewsText}>56,890</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.originalPrice}>₹2,999</Text>
            <Text style={styles.currentPrice}>₹1,500</Text>
            <Text style={styles.discountText}>50% Off</Text>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <Text style={styles.detailsText}>
              Perhaps the most iconic sneaker of all-time, this original "Chicago"? colorway is the cornerstone to any sneaker collection. Made famous in 1985 by Michael Jordan, the shoe has stood the test of time, becoming the most famous colorway of the Air Jordan 1. This 2015 release saw the
              <Text style={styles.moreText}> ...More</Text>
            </Text>
          </View>
        </View>

        {/* Store Info & Policy Chips */}
        <View style={styles.chipsContainer}>
          <View style={styles.chip}>
            <Ionicons name="location-outline" size={14} color="#676767" />
            <Text style={styles.chipText}>Nearest Store</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="lock-closed-outline" size={14} color="#676767" />
            <Text style={styles.chipText}>VIP</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="refresh-outline" size={14} color="#676767" />
            <Text style={styles.chipText}>Return policy</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <ActionButtons 
          onAddToCart={() => {}} 
          onBuyNow={() => {}} 
        />

        {/* Delivery Info */}
        <View style={styles.deliveryContainer}>
          <View style={styles.deliveryCard}>
            <Text style={styles.deliveryLabel}>Ngày giao hàng dự kiến</Text>
            <Text style={styles.deliveryDate}>20/03 - 23/03</Text>
          </View>
        </View>

        {/* Similar Products Button */}
        <TouchableOpacity style={styles.similarButton}>
          <Ionicons name="eye-outline" size={20} color="black" />
          <Text style={styles.similarButtonText}>Sản phẩm tương tự</Text>
        </TouchableOpacity>

        {/* Recommendations Section */}
        <View style={styles.recommendationHeader}>
          <Text style={styles.recommendTitle}>Bạn có thể thích</Text>
          <View style={styles.filterRow}>
            <Text style={styles.countText}>282+ Sản phẩm</Text>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.sortBtn}>
                <Text style={styles.actionBtnText}>Sort</Text>
                <Ionicons name="swap-vertical" size={14} color="black" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.sortBtn}>
                <Text style={styles.actionBtnText}>Filter</Text>
                <Ionicons name="filter" size={14} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Related Products Grid */}
        <View style={styles.relatedGrid}>
          {relatedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cartIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  mainImagePlaceholder: {
    width: width - 32,
    height: 213,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  nextButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    backgroundColor: '#F73658',
    width: 10,
  },
  productInfo: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  productTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
  },
  productSubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#000',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  reviewsText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#6B7280',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#000',
  },
  discountText: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#F97189',
  },
  detailsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#000',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: '#000',
    lineHeight: 16,
  },
  moreText: {
    color: '#F97189',
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 4,
  },
  chipText: {
    fontSize: 10,
    fontFamily: 'Montserrat_500Medium',
    color: '#6B7280',
  },
  deliveryContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  deliveryCard: {
    backgroundColor: '#FFCCD4',
    borderRadius: 5,
    padding: 12,
  },
  deliveryLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
  },
  deliveryDate: {
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold', // Fallback for Poppins
    color: '#000',
    marginTop: 8,
    textAlign: 'right',
  },
  similarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    gap: 8,
  },
  similarButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#000',
  },
  recommendationHeader: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  recommendTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  countText: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: '#000',
  },
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginTop: 16,
    paddingBottom: 40,
  },
});

export default ShopPage;
