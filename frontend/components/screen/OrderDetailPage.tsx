import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { orderApi, OrderDetailDTO, OrderStatus } from '../../lib/orderApi';
import { userApi } from '../../lib/userApi';

const OrderDetailPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [data, setData] = React.useState<OrderDetailDTO | null>(null);
  const [address, setAddress] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [cancelling, setCancelling] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const [detail, addresses] = await Promise.all([
        orderApi.getOrderDetail(Number(id)),
        userApi.getAddresses()
      ]);
      setData(detail);
      
      if (detail.order.shippingAddressId) {
        const addr = addresses.find(a => a.id === detail.order.shippingAddressId);
        setAddress(addr);
      }
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleUpdateStatus = async (status: OrderStatus, successMsg: string) => {
    try {
      setUpdating(true);
      await orderApi.updateOrderStatus(Number(id), status);
      Alert.alert('Thành công', successMsg);
      fetchDetail();
    } catch (error) {
      Alert.alert('Lỗi', 'Thao tác thất bại.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Xác nhận hủy',
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận hủy', 
          style: 'destructive',
          onPress: () => handleUpdateStatus('cancelled', 'Đã hủy đơn hàng.')
        }
      ]
    );
  };

  const handleConfirmReceipt = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn đã nhận được hàng và hài lòng với sản phẩm?',
      [
        { text: 'Chưa', style: 'cancel' },
        { 
          text: 'Đã nhận hàng', 
          onPress: () => handleUpdateStatus('delivered', 'Đã xác nhận nhận hàng.')
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F73658" />
        </View>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const { order, items } = data;

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao hàng';
      case 'delivered': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Section */}
        <View style={[styles.statusSection, (order.status === 'cancelled' || order.status === 'refunded') && { backgroundColor: '#9ca3af' }]}>
          <View>
            <Text style={styles.statusTitle}>{getStatusLabel(order.status)}</Text>
            <Text style={styles.orderNumber}>Mã đơn: {order.orderNumber}</Text>
          </View>
          <MaterialCommunityIcons 
            name={order.status === 'delivered' ? 'package-variant-closed' : order.status === 'shipping' ? 'truck-delivery-outline' : 'receipt'} 
            size={40} 
            color="white" 
          />
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#F73658" />
            <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
          </View>
          {address ? (
            <View>
              <Text style={styles.addressText}>{address.recipientName} | {address.recipientPhone}</Text>
              <Text style={styles.addressSub}>
                {address.streetAddress}, {address.ward}, {address.district}, {address.province}
              </Text>
            </View>
          ) : (
            <Text style={styles.addressSub}>Đang tải địa chỉ...</Text>
          )}
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="storefront-outline" size={18} color="#666" />
            <Text style={styles.sectionTitle}>Sản phẩm</Text>
          </View>
          {items.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.productItem}
              onPress={() => router.push(`/product/${item.productId}`)}
            >
              <Image 
                source={item.productImage ? { uri: item.productImage } : { uri: 'https://via.placeholder.com/100' }} 
                style={styles.productImage} 
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.productName}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>₫{item.unitPrice.toLocaleString('vi-VN')}</Text>
                  <Text style={styles.productQty}>x{item.quantity}</Text>
                </View>
                {order.status === 'delivered' && (
                  <TouchableOpacity 
                    style={styles.smallReviewButton}
                    onPress={() => router.push({ pathname: '/write-review' as any, params: { productId: item.productId, orderId: order.id } })}
                  >
                    <Text style={styles.smallReviewButtonText}>Đánh giá</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment & Summary */}
        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng tiền hàng</Text>
            <Text style={styles.summaryValue}>₫{order.subtotal.toLocaleString('vi-VN')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>₫{order.shippingFee.toLocaleString('vi-VN')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá</Text>
            <Text style={[styles.summaryValue, { color: '#F73658' }]}>-₫{order.discountAmount.toLocaleString('vi-VN')}</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }]}>
            <Text style={styles.totalLabel}>Thành tiền</Text>
            <Text style={styles.totalValue}>₫{order.totalAmount.toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phương thức thanh toán</Text>
            <Text style={styles.infoValue}>{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian đặt hàng</Text>
            <Text style={styles.infoValue}>{new Date(order.orderedAt).toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {order.status === 'pending' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton, cancelling && { opacity: 0.7 }]} 
              onPress={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? <ActivityIndicator color="#ef4444" /> : <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Hủy đơn hàng</Text>}
            </TouchableOpacity>
          )}

          {order.status === 'shipping' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton, updating && { opacity: 0.7 }]} 
              onPress={handleConfirmReceipt}
              disabled={updating}
            >
              {updating ? <ActivityIndicator color="white" /> : <Text style={styles.actionButtonText}>Đã nhận được hàng</Text>}
            </TouchableOpacity>
          )}

          {order.status === 'delivered' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]} 
              onPress={() => router.push({ pathname: '/write-review' as any, params: { orderId: order.id } })}
            >
              <Text style={styles.actionButtonText}>Đánh giá đơn hàng</Text>
            </TouchableOpacity>
          )}

          {(order.status === 'cancelled' || order.status === 'delivered') && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]} 
              onPress={() => router.push(`/shop/${order.shopId}` as any)}
            >
              <Text style={styles.actionButtonText}>Mua lại</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statusSection: {
    backgroundColor: '#10b981',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: 'white',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Montserrat_400Regular',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#333',
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#333',
  },
  addressSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#333',
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#333',
  },
  productQty: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat_500Medium',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#F73658',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'Montserrat_400Regular',
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: '#F73658',
    borderColor: '#F73658',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderColor: '#DDD',
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
    color: 'white',
  },
  smallReviewButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F73658',
  },
  smallReviewButtonText: {
    fontSize: 12,
    color: '#F73658',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrderDetailPage;
