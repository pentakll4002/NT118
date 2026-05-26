import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ProductBottomBarProps {
  onChat: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

const ProductBottomBar: React.FC<ProductBottomBarProps> = ({ onChat, onAddToCart, onBuyNow }) => {
  return (
    <View style={styles.bottomBarContainer}>
      <View style={styles.bottomBarPremium}>
        <View style={styles.bottomBarIcons}>
          <TouchableOpacity style={styles.barIconBtn} onPress={onChat}>
            <Ionicons name="chatbubbles-outline" size={22} color="#1a1a1a" />
            <Text style={styles.barIconLabel}>Chat</Text>
          </TouchableOpacity>
          
          <View style={styles.barDivider} />
          
          <TouchableOpacity style={styles.barIconBtn} onPress={onAddToCart}>
            <Ionicons name="cart-outline" size={22} color="#1a1a1a" />
            <Text style={styles.barIconLabel}>Giỏ hàng</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.addToCartBtnPremium}
          onPress={onAddToCart}
        >
          <Text style={styles.addToCartTextPremium}>THÊM VÀO GIỎ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buyNowBtnPremium}
          onPress={onBuyNow}
        >
          <Text style={styles.buyNowTextPremium}>MUA NGAY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  bottomBarPremium: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 24,
    height: 64,
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  bottomBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  barIconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  barIconLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 2,
  },
  barDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
  },
  addToCartBtnPremium: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFF0F0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addToCartTextPremium: {
    color: '#F83758',
    fontSize: 12,
    fontWeight: '800',
  },
  buyNowBtnPremium: {
    flex: 1.2,
    height: 48,
    backgroundColor: '#F83758',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F83758',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buyNowTextPremium: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default ProductBottomBar;
