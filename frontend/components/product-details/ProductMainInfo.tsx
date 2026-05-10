import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatPriceFull } from '../../lib/productApi';

interface ProductMainInfoProps {
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  soldCount: number;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  favLoading: boolean;
}

const ProductMainInfo: React.FC<ProductMainInfoProps> = ({ 
  name, price, originalPrice, discount, rating, soldCount, isFavorited, onToggleFavorite, favLoading 
}) => {
  return (
    <View style={styles.mainInfoCard}>
      <View style={styles.priceContainer}>
        <View style={styles.priceMain}>
          <Text style={styles.currencySymbol}>đ</Text>
          <Text style={styles.currentPriceText}>{price.toLocaleString('vi-VN')}</Text>
        </View>
        {originalPrice && originalPrice > price && (
          <View style={styles.oldPriceContainer}>
            <Text style={styles.oldPriceText}>{formatPriceFull(originalPrice)}</Text>
            {discount && (
              <View style={styles.discountBadgePremium}>
                <Text style={styles.discountTextPremium}>-{discount}%</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.titleContainer}>
        <View style={styles.badgeRow}>
          <View style={styles.mallBadgePremium}>
            <Text style={styles.mallTextPremium}>Mall</Text>
          </View>
          <View style={styles.freeShipBadge}>
            <Text style={styles.freeShipText}>FreeShip Xtra</Text>
          </View>
        </View>
        <Text style={styles.productNamePremium}>{name}</Text>
      </View>

      <View style={styles.engagementRow}>
        <View style={styles.engagementLeft}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color="#FBC02D" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
          <View style={styles.statDivider} />
          <Text style={styles.engagementStatText}>Đã bán {soldCount}</Text>
        </View>
        
        <View style={styles.engagementActions}>
          <TouchableOpacity 
            style={styles.actionCircle} 
            onPress={onToggleFavorite}
            disabled={favLoading}
          >
            <Ionicons 
              name={isFavorited ? "heart" : "heart-outline"} 
              size={22} 
              color={isFavorited ? "#F83758" : "#666"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainInfoCard: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F83758',
    marginRight: 2,
  },
  currentPriceText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F83758',
    letterSpacing: -1,
  },
  oldPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  oldPriceText: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadgePremium: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountTextPremium: {
    color: '#F83758',
    fontSize: 11,
    fontWeight: '700',
  },
  titleContainer: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  mallBadgePremium: {
    backgroundColor: '#F83758',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mallTextPremium: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  freeShipBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeShipText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: '800',
  },
  productNamePremium: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 24,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  engagementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#DDD',
    marginRight: 12,
  },
  engagementStatText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  engagementActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductMainInfo;
