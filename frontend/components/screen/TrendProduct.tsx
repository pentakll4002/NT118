import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';
import SearchBar from '../common/SearchBar';
import ProductCard, { Product } from '../common/ProductCard';

const { width } = Dimensions.get('window');

const trendProducts: Product[] = [
  {
    id: 1,
    name: 'Black Winter...',
    description: 'Autumn And Winter Casual cotton-padded jacket...',
    price: '₹499',
    rating: 4.5,
    reviews: '6,890',
    image: require('../../assets/images/trend-products/img/unsplash_0vsk2_9dkqo.svg'),
    imageHeight: 136,
  },
  {
    id: 2,
    name: 'Mens Starry',
    description: 'Mens Starry Sky Printed Shirt 100% Cotton Fabric',
    price: '₹399',
    rating: 4.5,
    reviews: '1,52,344',
    image: require('../../assets/images/trend-products/img/unsplash_9U18fiowwbw.svg'),
    imageHeight: 196,
  },
  {
    id: 3,
    name: 'Black Dress',
    description: 'Solid Black Dress for Women, Sexy Chain Shorts Ladi...',
    price: '₹2,000',
    rating: 4.5,
    reviews: '5,23,456',
    image: require('../../assets/images/trend-products/img/unsplash_NoVnXXmDNi0.svg'),
    imageHeight: 196,
  },
  {
    id: 4,
    name: 'Pink Embroide...',
    description: 'EARTHEN Rose Pink Embroidered Tiered Max...',
    price: '₹1,900',
    rating: 4.5,
    reviews: '45,678',
    image: require('../../assets/images/trend-products/img/unsplash_Pdds9XsWyoM.svg'),
    imageHeight: 136,
  },
  {
    id: 5,
    name: 'Sony PS4',
    description: 'Sony PS4 Console, 1TB Slim with 3 Games: Gran Turis...',
    price: '₹1,999',
    rating: 3.5,
    reviews: '8,35,566',
    image: require('../../assets/images/trend-products/img/unsplash_yTBMYCcZQRs.svg'),
    imageHeight: 136,
  },
  {
    id: 6,
    name: 'Flare Dress',
    description: 'Antheaa Black & Rust Orange Floral Print Tiered Midi F...',
    price: '₹1,990',
    rating: 4.5,
    reviews: '3,35,566',
    image: require('../../assets/images/trend-products/img/unsplash_0vsk2_9dkqo-1.svg'),
    imageHeight: 136,
  },
  {
    id: 7,
    name: 'D7200 Digital C...',
    description: 'D7200 Digital Camera (Nikon) In New Area...',
    price: '₹26,999',
    rating: 4.5,
    reviews: '67,456',
    image: require('../../assets/images/trend-products/img/unsplash_9U18fiowwbw-1.svg'),
    imageHeight: 196,
  },
  {
    id: 8,
    name: 'men’s & boys s...',
    description: 'George Walker Derby Brown Formal Shoes',
    price: '₹999',
    rating: 5.0,
    reviews: '13,45,678',
    image: require('../../assets/images/trend-products/img/unsplash_Pdds9XsWyoM-1.svg'),
    imageHeight: 136,
  },
];

const TrendProduct = () => {
  const leftCol = trendProducts.filter((_, i) => i % 2 === 0);
  const rightCol = trendProducts.filter((_, i) => i % 2 !== 0);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <SearchBar />
      
      <View style={styles.headerRow}>
        <Text style={styles.productCount}>52,082+ Sản phẩm</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Sort</Text>
            <Ionicons name="swap-vertical" size={14} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Filter</Text>
            <Ionicons name="filter" size={14} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.masonryContainer}>
        <View style={styles.column}>
          {leftCol.map(product => (
            <ProductCard key={product.id} product={product} isMasonry />
          ))}
        </View>
        <View style={styles.column}>
          {rightCol.map(product => (
            <ProductCard key={product.id} product={product} isMasonry />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  productCount: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: '#000',
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
});

export default TrendProduct;
