import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Animated, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProductCard, { Product } from '../common/ProductCard';
import { getProducts, formatPriceFull, formatSold } from '../../lib/productApi';
import { claimGift } from '../../lib/walletApi';

import { CheckoutCartItem } from '../common/PaymentProductSection';

interface OrderSuccessPageProps {
  isPendingPayment?: boolean; // For VNPay waiting, or COD (success)
  cartItems?: CheckoutCartItem[];
  finalTotal?: number;
  paymentUrl?: string;
}

const { width } = Dimensions.get('window');
const PRODUCT_WIDTH = (width - 48) / 2;

export default function OrderSuccessPage({ isPendingPayment = false, cartItems = [], finalTotal = 0, paymentUrl }: OrderSuccessPageProps) {
  const [recommendedProducts, setRecommendedProducts] = React.useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(true);
  const [turnsRemaining, setTurnsRemaining] = React.useState(1);
  const [claiming, setClaiming] = React.useState(false);
  const [rewardModalVisible, setRewardModalVisible] = React.useState(false);
  const [rewardAmount, setRewardAmount] = React.useState(0);
  const [rewardBalance, setRewardBalance] = React.useState(0);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  const router = useRouter();

  React.useEffect(() => {
    if (turnsRemaining <= 0) return;
    
    let isMounted = true;
    const bounce = () => {
      if (!isMounted) return;
      bounceAnim.setValue(0);
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isMounted) {
          setTimeout(bounce, 800);
        }
      });
    };
    
    bounce();
    return () => {
      isMounted = false;
    };
  }, [bounceAnim, turnsRemaining]);

  const handleOpenGift = async () => {
    if (turnsRemaining <= 0 || claiming) return;
    setClaiming(true);
    try {
      const res = await claimGift();
      setTurnsRemaining(0);
      setRewardAmount(res.amountClaimed);
      setRewardBalance(res.newBalance);
      setRewardModalVisible(true);
      
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      try {
        const Haptics = require('expo-haptics');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    } catch (err: any) {
      console.log('Claim gift failed', err);
      Alert.alert('Lỗi', 'Không thể mở quà lúc này. Vui lòng thử lại sau.');
    } finally {
      setClaiming(false);
    }
  };

  React.useEffect(() => {
    const fetchRecommended = async () => {
      setLoadingProducts(true);
      try {
        const res = await getProducts({ pageSize: 6, sort: 'popular' });
        const mapped = res.data.map(dto => ({
          id: dto.id.toString(),
          name: dto.name,
          description: dto.description || '',
          price: formatPriceFull(dto.price),
          originalPrice: dto.originalPrice ? formatPriceFull(dto.originalPrice) : undefined,
          discount: dto.discount > 0 ? `-${dto.discount}%` : undefined,
          rating: dto.rating,
          reviews: formatSold(dto.soldQuantity),
          image: dto.image ? { uri: dto.image } : require('../../assets/images/product/product-1.png'),
          imageHeight: 180,
        }));
        setRecommendedProducts(mapped);
      } catch (err) {
        console.log('Fetch recommendations failed', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchRecommended();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Ionicons name="cart-outline" size={26} color="#FFFFFF" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <View style={styles.statusRow}>
            <Ionicons name={isPendingPayment ? "alert-circle" : "checkmark-circle"} size={32} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Text style={styles.statusTitle}>
              {isPendingPayment ? 'Đang chờ thanh toán' : 'Đặt hàng thành công'}
            </Text>
          </View>
          
          {isPendingPayment && paymentUrl && (
            <View style={styles.qrContainer}>
              <Text style={styles.qrInstruction}>Quét mã QR bằng ứng dụng ngân hàng để thanh toán</Text>
              <Image source={{ uri: paymentUrl }} style={styles.qrImage} resizeMode="contain" />
              <Text style={styles.qrWarning}>Lưu ý: Không thay đổi số tiền và nội dung chuyển khoản</Text>
            </View>
          )}

          {/* Order Details (Replaces warning text) */}
          <View style={styles.orderDetailsContainer}>
            <Text style={styles.orderDetailsTitle}>Chi tiết đơn hàng</Text>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.orderItemRow}>
                <Image source={{ uri: item.mainImageUrl || 'https://via.placeholder.com/50' }} style={styles.orderItemImg} />
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName} numberOfLines={2}>{item.productName}</Text>
                  <Text style={styles.orderItemMeta}>Số lượng: {item.quantity}</Text>
                </View>
                <Text style={styles.orderItemPrice}>{formatPriceFull(item.unitPrice * (item.quantity || 1))}</Text>
              </View>
            ))}
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalValue}>{formatPriceFull(finalTotal)}</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButtonOutline} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.actionButtonOutlineText}>Về trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonFilled} onPress={() => router.push('/(tabs)/settings')}>
              <Text style={styles.actionButtonFilledText}>Đơn mua</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promotion Box (100% Trúng Xu) */}
        <View style={styles.promoContainer}>
          <View style={styles.promoTitleBox}>
            <Ionicons name="help-circle" size={20} color="#1B1530" style={{ position: 'absolute', left: 10 }} />
            <Text style={styles.promoTitle}>🎁 100% NHẬN XU THƯỞNG 🎁</Text>
            <Ionicons name="gift" size={20} color="#1B1530" style={{ position: 'absolute', right: 10 }} />
          </View>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleOpenGift}
            disabled={turnsRemaining <= 0 || claiming}
            style={styles.giftBoxWrapper}
          >
            {turnsRemaining > 0 && <View style={styles.glowRing} />}
            
            {claiming ? (
              <ActivityIndicator size="large" color="#FFD700" style={{ height: 80, width: 80 }} />
            ) : (
              <Animated.Image 
                source={{ 
                  uri: turnsRemaining > 0 
                    ? 'https://cdn-icons-png.flaticon.com/512/4213/4213958.png' 
                    : 'https://cdn-icons-png.flaticon.com/512/4213/4213643.png' 
                }} 
                style={[
                  styles.giftBoxIcon,
                  { transform: [{ translateY: bounceAnim }] }
                ]} 
              />
            )}
            {turnsRemaining > 0 && (
              <View style={styles.giftLabel}>
                <Text style={styles.giftLabelText}>NHẤN ĐỂ MỞ</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.turnRemainingBox}>
            <Text style={styles.turnRemainingText}>
              {turnsRemaining > 0 ? 'Bạn có 1 hộp quà may mắn chưa mở!' : 'Bạn đã nhận quà thành công!'}
            </Text>
          </View>
        </View>

        {/* Suggestions Section */}
        <View style={styles.suggestionsHeader}>
          <View style={styles.line} />
          <Text style={styles.suggestionsTitle}>Có thể bạn cũng thích</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.productList}>
          {loadingProducts ? (
            <View style={{ flex: 1, padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#F83758" />
            </View>
          ) : (
            recommendedProducts.map((prod) => (
              <ProductCard 
                key={prod.id} 
                product={prod as any} 
                onPress={(p) => {
                  router.push(`/product/${p.id}` as any);
                }}
              />
            ))
          )}
        </View>

      </ScrollView>

      {/* Reward Claimed Modal */}
      <Modal
        visible={rewardModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRewardModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.rewardHeader}>🎉 MỞ HỘP QUÀ THÀNH CÔNG! 🎉</Text>
            
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png' }} 
              style={styles.rewardIcon} 
              resizeMode="contain"
            />
            
            <Text style={styles.rewardText}>+{rewardAmount.toLocaleString('vi-VN')} Xu</Text>
            
            <Text style={styles.rewardSubtext}>
              Chúc mừng bạn đã nhận được xu từ hộp quà may mắn 100% trúng xu!
            </Text>

            <View style={styles.rewardBalanceBox}>
              <Text style={styles.rewardBalanceText}>Số dư Ví ShopeePay & Xu mới</Text>
              <Text style={styles.rewardBalanceValue}>{rewardBalance.toLocaleString('vi-VN')}đ (xu)</Text>
            </View>

            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => setRewardModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Tuyệt vời</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F83758', // Brand color
  },
  backButton: {
    padding: 4,
  },
  bannerContainer: {
    backgroundColor: '#F83758', // Brand gradient base
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  orderDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  qrInstruction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  qrImage: {
    width: 250,
    height: 300,
    marginBottom: 12,
  },
  qrWarning: {
    fontSize: 12,
    color: '#F83758',
    textAlign: 'center',
    fontWeight: '600',
  },
  orderDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
  },
  orderItemRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  orderItemImg: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  orderItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  orderItemName: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  orderItemMeta: {
    fontSize: 12,
    color: '#777',
  },
  orderItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F83758',
    marginLeft: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F83758',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  actionButtonOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
  },
  actionButtonOutlineText: {
    color: '#F83758',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonFilled: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 4,
    marginLeft: 10,
    alignItems: 'center',
  },
  actionButtonFilledText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  promoContainer: {
    backgroundColor: '#1B1530',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFD700',
    elevation: 6,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  promoTitleBox: {
    backgroundColor: '#FFD700',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    elevation: 3,
  },
  promoTitle: {
    color: '#1B1530',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  giftBoxWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  giftBoxIcon: {
    width: 80,
    height: 80,
  },
  giftLabel: {
    backgroundColor: '#E53935',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    position: 'absolute',
    top: 25,
  },
  giftLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  turnRemainingBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  turnRemainingText: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 13,
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    zIndex: -1,
  },
  // Custom Reward Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  rewardHeader: {
    fontSize: 18,
    fontWeight: '900',
    color: '#E53935',
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  rewardIcon: {
    width: 130,
    height: 130,
    marginVertical: 12,
  },
  rewardText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FF9100',
    marginVertical: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rewardSubtext: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
    marginHorizontal: 10,
    marginBottom: 24,
  },
  rewardBalanceBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  rewardBalanceText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  rewardBalanceValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '700',
    marginTop: 2,
  },
  modalCloseButton: {
    backgroundColor: '#EE4D2D',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 36,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDDDD',
  },
  suggestionsTitle: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#666666',
  },
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
});
