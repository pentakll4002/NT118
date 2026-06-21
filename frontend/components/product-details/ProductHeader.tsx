import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatPriceFull } from '../../lib/productApi';

interface ProductHeaderProps {
  productName: string;
  productPrice: number;
  cartCount: number;
  onVoicePress?: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ productName, productPrice, cartCount, onVoicePress }) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#F83758" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle} numberOfLines={1}>
        {productName}
      </Text>

      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={async () => {
            try {
              await Share.share({
                message: `${productName} - ${formatPriceFull(productPrice)} | Xem tại ShopeeLite`,
              });
            } catch (e) { /* user cancelled */ }
          }}
        >
          <Ionicons name="share-social-outline" size={24} color="#F83758" />
        </TouchableOpacity>

        {onVoicePress && (
          <TouchableOpacity style={styles.iconButton} onPress={onVoicePress}>
            <Ionicons name="mic-outline" size={24} color="#F83758" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(tabs)/cart')}>
          <Ionicons name="cart-outline" size={24} color="#F83758" />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F83758',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default ProductHeader;
