import { Image } from 'expo-image';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ShopDTO } from '../../lib/shopApi';

interface ProductShopInfoProps {
  shop: ShopDTO | null;
}

const ProductShopInfo: React.FC<ProductShopInfoProps> = ({ shop }) => {
  const router = useRouter();

  if (!shop) return null;

  return (
    <View style={styles.shopSection}>
      <View style={styles.shopRow}>
        <View style={styles.shopAvatar}>
          {shop.logoUrl ? (
            <Image source={{ uri: shop.logoUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.shopAvatarInitials}>{shop.name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.shopActiveText}>Online 5 phút trước</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewShopButton}
          onPress={() => router.push(`/shop/${shop.id}` as any)}
        >
          <Text style={styles.viewShopText}>Xem Shop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shopSection: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shopAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  shopAvatarInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: '#999',
  },
  shopInfo: {
    flex: 1,
    marginLeft: 15,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  shopActiveText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  viewShopButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F83758',
  },
  viewShopText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F83758',
  },
});

export default ProductShopInfo;
