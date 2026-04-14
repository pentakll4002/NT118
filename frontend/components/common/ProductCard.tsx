import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating: number;
  reviews: string;
  image: any;
  imageHeight?: number;
}

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  isHorizontal?: boolean;
  isMasonry?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  isHorizontal = false,
  isMasonry = false
}) => {
  const cardWidth = isHorizontal ? 170 : isMasonry ? (width - 40) / 2 : (width - 48) / 2;

  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        isHorizontal && styles.horizontalCard,
        isMasonry && { width: cardWidth, marginBottom: 12 }
      ]}
      onPress={() => onPress?.(product)}
      activeOpacity={0.9}
    >
      <View style={[
        styles.productImageContainer,
        isMasonry && product.imageHeight ? { height: product.imageHeight } : {}
      ]}>
        <Image source={product.image} style={styles.productImage} resizeMode="cover" />
        {product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{product.discount}</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.price}</Text>
        {product.originalPrice && (
          <View style={styles.priceRow}>
            <Text style={styles.originalPrice}>{product.originalPrice}</Text>
          </View>
        )}
        <View style={styles.ratingRow}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name={i <= Math.floor(product.rating) ? "star" : i - 0.5 <= product.rating ? "star-half" : "star-outline"}
                size={12}
                color={i <= product.rating + 0.5 ? "#EDB310" : "#A8A8A9"}
              />
            ))}
          </View>
          <Text style={styles.reviewsText}>{product.reviews}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  horizontalCard: {
    width: 170,
    marginRight: 12,
    marginBottom: 0,
  },
  productImageContainer: {
    width: '100%',
    height: 128,
    backgroundColor: '#F0F0F0',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#F83758',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
    lineHeight: 16,
  },
  productDesc: {
    fontSize: 10,
    color: '#676767',
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    color: '#F83758',
    fontFamily: 'Montserrat_600SemiBold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  originalPrice: {
    fontSize: 10,
    color: '#BBBBBB',
    textDecorationLine: 'line-through',
    fontFamily: 'Montserrat_300Light',
  },
  discountText: {
    fontSize: 10,
    color: '#FE735C',
    fontFamily: 'Montserrat_400Regular',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
  },
  reviewsText: {
    fontSize: 10,
    color: '#A8A8A9',
    fontFamily: 'Montserrat_400Regular',
  },
});

export default ProductCard;
