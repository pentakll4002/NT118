import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

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
  location?: string;
  isMall?: boolean;
  isFreeShip?: boolean;
}

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  isHorizontal?: boolean;
  isMasonry?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  isHorizontal = false,
  isMasonry = false,
  isFavorited,
  onToggleFavorite,
}) => {
  const cardWidth = isHorizontal ? 160 : (width - 36) / 2;

  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        isHorizontal ? styles.horizontalCard : { width: cardWidth },
        isMasonry && { marginBottom: 10 }
      ]}
      onPress={() => onPress?.(product)}
      activeOpacity={0.85}
    >
      <View style={[
        styles.productImageContainer,
        isMasonry && product.imageHeight ? { height: product.imageHeight } : { aspectRatio: 1.05 }
      ]}>
        <Image 
          source={product.image} 
          style={styles.productImage} 
          contentFit="cover"
          transition={300}
          cachePolicy="disk"
        />
        
        {product.isMall && (
          <View style={[styles.badge, styles.mallBadge]}>
            <Text style={styles.badgeText}>MALL</Text>
          </View>
        )}

        {product.isFreeShip && (
          <View style={[styles.badge, styles.freeShipBadge]}>
            <Text style={styles.badgeText}>FREE SHIP+</Text>
          </View>
        )}
        
        {product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{product.discount}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.heartButton, isFavorited && styles.heartButtonActive]}
          onPress={(e) => { 
            e.stopPropagation?.(); 
            if (onToggleFavorite) {
              onToggleFavorite(product);
            } else {
              Alert.alert('Yêu thích', 'Vui lòng đăng nhập để thêm vào yêu thích.');
            }
          }}
        >
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={16}
            color={isFavorited ? '#FFF' : '#888'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.priceContainer}>
          <View style={styles.mainPrice}>
            <Text style={styles.currencySymbol}>₫</Text>
            <Text style={styles.productPrice}>
              {product.price.replace('₫', '')}
            </Text>
          </View>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>
              {product.originalPrice}
            </Text>
          )}
        </View>

        <View style={styles.footerRow}>
          <View style={styles.footerInfo}>
            {product.location && (
              <Text style={styles.locationText}>{product.location}</Text>
            )}
            <View style={styles.rightFooter}>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={10} color="#FFD700" />
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.soldText}>{product.reviews}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#1B1530',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(27, 21, 48, 0.03)',
  },
  horizontalCard: {
    width: 160,
    marginRight: 10,
    marginBottom: 4,
  },
  productImageContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(238, 77, 45, 0.92)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
    zIndex: 2,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  heartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 2,
  },
  heartButtonActive: {
    backgroundColor: '#FF4D4F',
  },
  productInfo: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 110, // Ensure enough height to push footer to bottom consistently
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    color: '#1B1530',
    height: 36, // Fixed height for 2 lines to keep alignment consistent
  },
  priceContainer: {
    marginTop: 6,
  },
  mainPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EE4D2D',
    marginRight: 1,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EE4D2D',
  },
  originalPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  footerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
    marginLeft: 2,
    fontFamily: 'Montserrat_700Bold',
  },
  divider: {
    width: 1,
    height: 8,
    backgroundColor: '#DDD',
    marginHorizontal: 4,
  },
  locationText: {
    fontSize: 10,
    color: '#888',
    fontFamily: 'Montserrat_400Regular',
  },
  soldText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  badge: {
    position: 'absolute',
    left: 0,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderBottomRightRadius: 4,
    zIndex: 3,
  },
  mallBadge: {
    top: 0,
    backgroundColor: '#D0011B',
  },
  freeShipBadge: {
    bottom: 0,
    backgroundColor: '#4392F9',
    borderBottomRightRadius: 0,
    borderTopRightRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
});

export default ProductCard;
