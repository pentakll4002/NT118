import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { 
  getOrderDetail, 
  updateOrderStatus, 
  OrderDetailResponse, 
  formatOrderStatus, 
  formatPaymentStatus, 
  formatPaymentMethod, 
  formatPriceFull 
} from '../../lib/orderApi';
import * as Haptics from 'expo-haptics';
import Map from './Map';
import LiveTrackingMap from './LiveTrackingMap';
import { useSignalREventListener } from '../../lib/notificationApi';

const SC: Record<string, string> = { 
  pending: '#F59E0B', 
  confirmed: '#3B82F6', 
  shipping: '#F97316', 
  delivered: '#10B981', 
  cancelled: '#EF4444',
  refunded: '#00ACC1' 
};

const PC: Record<string, string> = { 
  pending: '#F59E0B', 
  paid: '#10B981', 
  failed: '#EF4444',
  refunded: '#00ACC1' 
};

export default function OrderDetailScreen({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [data, setData] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  
  // Refund claim states
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [refundStatusStep, setRefundStatusStep] = useState<'form' | 'processing' | 'success'>('form');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await getOrderDetail(orderId);
      setData(res);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Auto reload when order status changes in real-time
  useSignalREventListener<{ orderId: number; status: string }>('order.status_changed', (data) => {
    if (data.orderId === orderId) {
      fetchOrder();
    }
  });

  const handleCancelOrder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này? Tiền thanh toán qua Ví ShopeePay (nếu có) sẽ được hoàn lại số dư ngay lập tức.',
      [
        { text: 'Bỏ qua', style: 'cancel' },
        {
          text: 'Xác nhận hủy',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              await updateOrderStatus(orderId, 'cancelled');
              const updated = await getOrderDetail(orderId);
              setData(updated);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Thành công', 'Đơn hàng của bạn đã được hủy thành công.');
            } catch (err: any) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể hủy đơn hàng.');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const handleOpenRefundModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefundReason('');
    setRefundNotes('');
    setRefundStatusStep('form');
    setRefundModalVisible(true);
  };

  const handleRequestRefund = async () => {
    if (!refundReason) {
      Alert.alert('Lỗi', 'Vui lòng chọn lý do khiếu nại hoàn tiền.');
      return;
    }
    
    setRefundStatusStep('processing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate processing claims and approval
    setTimeout(async () => {
      try {
        await updateOrderStatus(orderId, 'refunded');
        setRefundStatusStep('success');
        const updated = await getOrderDetail(orderId);
        setData(updated);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err: any) {
        setRefundModalVisible(false);
        setRefundStatusStep('form');
        Alert.alert('Lỗi', err.response?.data?.message || 'Không thể gửi khiếu nại hoàn tiền.');
      }
    }, 2500);
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#EE4D2D" />
        </View>
      </SafeAreaView>
    );
  }

  if (err || !data) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={s.center}>
          <Text style={{ color: '#EF4444' }}>{err || 'Không tìm thấy đơn hàng'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { order, items, shippingAddress, shopLatitude, shopLongitude } = data;
  const statusLower = order.status.toLowerCase();
  const sc = SC[statusLower] || '#64748B';
  const pc = PC[order.paymentStatus.toLowerCase()] || '#64748B';

  const showCancelBtn = statusLower === 'pending' || statusLower === 'confirmed';
  const showRefundBtn = statusLower === 'delivered';

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Status banner */}
        <View style={[s.card, { borderLeftColor: sc, borderLeftWidth: 4 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="box" size={22} color={sc} />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: sc }}>
                  {formatOrderStatus(order.status)}
                </Text>
                <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                  Mã đơn: #{order.orderNumber}
                </Text>
              </View>
            </View>
          </View>
          <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>
            Ngày đặt hàng: {new Date(order.orderedAt).toLocaleString('vi-VN')}
          </Text>
        </View>

        {/* Shipping Address & Map */}
        {shippingAddress && (
          <View style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
              <Ionicons name="location-sharp" size={18} color="#EE4D2D" />
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>
                Địa chỉ nhận hàng
              </Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E293B' }}>
              {shippingAddress.recipientName} ({shippingAddress.recipientPhone})
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 }}>
              {[
                shippingAddress.streetAddress,
                shippingAddress.ward,
                shippingAddress.district,
                shippingAddress.province
              ].filter(Boolean).join(', ')}
            </Text>
            
            {shippingAddress.latitude && shippingAddress.longitude && (
              <View style={{ marginTop: 12 }}>
                {statusLower === 'shipping' ? (
                  <LiveTrackingMap 
                    orderId={order.id} 
                    customerLat={shippingAddress.latitude} 
                    customerLng={shippingAddress.longitude} 
                    shopLat={shopLatitude}
                    shopLng={shopLongitude}
                  />
                ) : (
                  <Map 
                    latitude={shippingAddress.latitude} 
                    longitude={shippingAddress.longitude} 
                    title={shippingAddress.poiName || "Vị trí giao hàng"}
                    description={shippingAddress.formattedAddress || "Địa chỉ nhận hàng"}
                  />
                )}
              </View>
            )}
          </View>
        )}

        {/* Payment details */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Thông tin thanh toán</Text>
          
          <View style={s.row}>
            <Text style={s.lbl}>Phương thức</Text>
            <Text style={s.val}>
              {order.paymentMethod === 'wallet' ? 'Ví ShopeePay' : formatPaymentMethod(order.paymentMethod)}
            </Text>
          </View>

          <View style={s.row}>
            <Text style={s.lbl}>Trạng thái thanh toán</Text>
            <View style={{ backgroundColor: pc + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: pc }}>
                {formatPaymentStatus(order.paymentStatus)}
              </Text>
            </View>
          </View>
        </View>

        {/* Products list */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Sản phẩm ({items.length})</Text>
          {items.map(it => (
            <View key={it.id} style={s.productRow}>
              {it.productImage ? (
                <Image source={{ uri: it.productImage }} style={s.productImage} />
              ) : (
                <View style={s.productImagePlaceholder}>
                  <Feather name="image" size={20} color="#CBD5E1" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={s.productName} numberOfLines={2}>{it.productName}</Text>
                <Text style={s.productQty}>Số lượng: {it.quantity}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.productPrice}>{formatPriceFull(it.totalPrice)}</Text>
                {statusLower === 'delivered' && (
                  <TouchableOpacity 
                    style={s.reviewBtn}
                    onPress={() => router.push({
                      pathname: '/write-review',
                      params: { productId: it.productId, orderId: order.id }
                    })}
                  >
                    <Text style={s.reviewBtnText}>Đánh giá</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Pricing Summary */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Chi tiết giá</Text>
          <View style={s.row}>
            <Text style={s.lbl}>Tạm tính</Text>
            <Text style={s.val}>{formatPriceFull(order.subtotal)}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.lbl}>Phí vận chuyển</Text>
            <Text style={s.val}>{order.shippingFee === 0 ? 'Miễn phí' : formatPriceFull(order.shippingFee)}</Text>
          </View>
          {order.discountAmount > 0 && (
            <View style={s.row}>
              <Text style={s.lbl}>Giảm giá Voucher</Text>
              <Text style={[s.val, { color: '#10B981' }]}>-{formatPriceFull(order.discountAmount)}</Text>
            </View>
          )}
          <View style={[s.row, s.totalRow]}>
            <Text style={s.totalLabel}>Tổng thanh toán</Text>
            <Text style={s.totalPriceLarge}>{formatPriceFull(order.totalAmount)}</Text>
          </View>
        </View>

        {order.notes && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Ghi chú từ người mua</Text>
            <Text style={{ fontSize: 13, color: '#475569', lineHeight: 18 }}>{order.notes}</Text>
          </View>
        )}

      </ScrollView>

      {/* Floating Action Button Bar at Bottom */}
      {(showCancelBtn || showRefundBtn) && (
        <View style={s.bottomActionBar}>
          {showCancelBtn && (
            <TouchableOpacity 
              style={[s.actionButton, s.cancelBtn, submitting && { opacity: 0.6 }]} 
              onPress={handleCancelOrder}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={s.actionButtonText}>HỦY ĐƠN HÀNG</Text>
              )}
            </TouchableOpacity>
          )}

          {showRefundBtn && (
            <TouchableOpacity 
              style={[s.actionButton, s.refundBtn]} 
              onPress={handleOpenRefundModal}
            >
              <Text style={s.actionButtonText}>YÊU CẦU TRẢ HÀNG/HOÀN TIỀN</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Return/Refund Claim Modal */}
      <Modal
        visible={refundModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRefundModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            
            {refundStatusStep === 'form' && (
              <View>
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>Yêu cầu hoàn trả hàng</Text>
                  <TouchableOpacity onPress={() => setRefundModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#888" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                  <Text style={s.inputLabel}>Chọn lý do khiếu nại hoàn tiền</Text>
                  {[
                    'Sản phẩm bị lỗi, không hoạt động',
                    'Người bán giao sai mẫu mã / thiếu hàng',
                    'Sản phẩm khác biệt rõ rệt so với mô tả',
                    'Nghi ngờ sản phẩm là hàng giả, hàng nhái',
                    'Không còn nhu cầu sử dụng'
                  ].map((reason) => (
                    <TouchableOpacity 
                      key={reason}
                      style={[s.reasonOption, refundReason === reason && s.reasonOptionActive]}
                      onPress={() => setRefundReason(reason)}
                    >
                      <Ionicons 
                        name={refundReason === reason ? "radio-button-on" : "radio-button-off"} 
                        size={18} 
                        color={refundReason === reason ? "#EE4D2D" : "#718096"} 
                      />
                      <Text style={[s.reasonText, refundReason === reason && s.reasonTextActive]}>
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <Text style={[s.inputLabel, { marginTop: 20 }]}>Chi tiết khiếu nại (Không bắt buộc)</Text>
                  <TextInput
                    style={s.textArea}
                    multiline
                    numberOfLines={4}
                    placeholder="Mô tả cụ thể lý do khiếu nại (ví dụ: sản phẩm vỡ vỏ hộp, không lên nguồn...)"
                    value={refundNotes}
                    onChangeText={setRefundNotes}
                  />

                  <TouchableOpacity style={s.submitRefundBtn} onPress={handleRequestRefund}>
                    <Text style={s.submitRefundBtnText}>Gửi yêu cầu khiếu nại</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}

            {refundStatusStep === 'processing' && (
              <View style={s.centerCard}>
                <ActivityIndicator size="large" color="#EE4D2D" />
                <Text style={s.stepTitle}>Đang gửi khiếu nại hoàn tiền...</Text>
                <Text style={s.stepSub}>
                  Hệ thống bảo vệ quyền lợi khách hàng ShopeeLite đang kết nối thông tin giao dịch của bạn.
                </Text>
              </View>
            )}

            {refundStatusStep === 'success' && (
              <View style={s.centerCard}>
                <View style={s.successBadge}>
                  <Ionicons name="checkmark" size={32} color="#FFF" />
                </View>
                <Text style={s.stepTitle}>Khiếu nại được duyệt tự động!</Text>
                <Text style={s.stepSub}>
                  Yêu cầu trả hàng hoàn tiền của bạn đã được thông qua. Số tiền {formatPriceFull(order.totalAmount)} đã được hoàn trả lại ngay lập tức vào **Ví ShopeePay** của bạn.
                </Text>
                <TouchableOpacity 
                  style={s.doneBtn} 
                  onPress={() => setRefundModalVisible(false)}
                >
                  <Text style={s.doneBtnText}>Hoàn tất</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  lbl: {
    fontSize: 14,
    color: '#64748B',
  },
  val: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    marginRight: 12,
  },
  productImagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  productQty: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EE4D2D',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  totalPriceLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EE4D2D',
  },
  // Bottom Floating Bar
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#EF4444',
  },
  refundBtn: {
    backgroundColor: '#EE4D2D',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // Modal Style
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  reasonOptionActive: {
    backgroundColor: '#FFF5F5',
  },
  reasonText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  reasonTextActive: {
    color: '#EE4D2D',
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
  },
  submitRefundBtn: {
    backgroundColor: '#EE4D2D',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitRefundBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  centerCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
    textAlign: 'center',
  },
  stepSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    marginBottom: 20,
  },
  successBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00ACC1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  doneBtn: {
    backgroundColor: '#00ACC1',
    width: '100%',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  reviewBtn: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF4747',
  },
  reviewBtnText: {
    fontSize: 12,
    color: '#FF4747',
    fontWeight: '600',
  },
});
