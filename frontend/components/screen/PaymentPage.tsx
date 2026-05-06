import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PaymentAddressSection, { UserAddressType } from '../common/PaymentAddressSection';
import PaymentProductSection, { CheckoutCartItem } from '../common/PaymentProductSection';
import PaymentShippingSection from '../common/PaymentShippingSection';
import PaymentMethodSection from '../common/PaymentMethodSection';
import PaymentVoucherSection from '../common/PaymentVoucherSection';
import PaymentSummarySection from '../common/PaymentSummarySection';
import PaymentBottomBar from '../common/PaymentBottomBar';
import { PLATFORM_VOUCHERS } from '../../features/Cart/PlatformVoucherModal';
import AddressSelectionPage from './AddressSelectionPage';
import AddAddressPage from './AddAddressPage';
import OrderSuccessPage from './OrderSuccessPage';
import { apiClient } from '../../lib/apiClient';
import { sendMessage } from '../../lib/messageApi';
import { ShippingMethod } from '../common/PaymentShippingSection';

interface PaymentPageProps {
  onClose: () => void;
  totalAmount: number;
  productId?: number;
  quantity?: number;
  cartItemIds?: string;
  platformVoucherIds?: string;
  shopVoucherId?: number;
}

type ScreenState = 'payment' | 'address_selection' | 'add_address' | 'success';

export default function PaymentPage({ onClose, totalAmount, productId, quantity, cartItemIds, platformVoucherIds, shopVoucherId }: PaymentPageProps) {
  const [activeScreen, setActiveScreen] = useState<ScreenState>('payment');
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UserAddressType | null>(null);
  const [cartItems, setCartItems] = useState<CheckoutCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vietqr'>('cod');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState<string | undefined>(undefined);
  const [editingAddressId, setEditingAddressId] = useState<number | undefined>(undefined);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('mienshi' as ShippingMethod);
  const [shopVoucher, setShopVoucher] = useState<any | null>(null);
  const [platformVouchers, setPlatformVouchers] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; voucherId: number } | null>(null);
  const [shippingFee, setShippingFee] = useState<number>(25000);
  const [shippingDistanceKm, setShippingDistanceKm] = useState<number | null>(null);
  const [isEstimatingShipping, setIsEstimatingShipping] = useState(false);

  const fetchAddress = async () => {
    try {
      const response = await apiClient.get('/api/user/addresses');
      const addresses = response.data?.data || response.data;
      if (addresses && addresses.length > 0) {
        const defaultAddr = addresses.find((a: UserAddressType) => a.isDefault) || addresses[0];
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.log("Failed to fetch address:", error);
    }
  };

  const fetchCart = async () => {
    if (productId && quantity) {
      try {
        const response = await apiClient.get(`/api/products/${productId}`);
        const prod = response.data?.data || response.data;
        if (prod) {
          setCartItems([{
            id: -1,
            productId: prod.id,
            productName: prod.name,
            unitPrice: prod.price,
            quantity: quantity,
            mainImageUrl: prod.image,
            shopId: prod.shopId,
          }]);
        }
      } catch (error) {
        console.log('Failed to fetch buy now product:', error);
      }
      return;
    }

    try {
      const response = await apiClient.get('/api/cart');
      let data = response.data?.data || response.data;
      if (Array.isArray(data) && cartItemIds) {
         const selectedIds = cartItemIds.split(',').map(Number);
         data = data.filter((item: any) => selectedIds.includes(item.id));
      }
      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Failed to fetch cart:', error);
      setCartItems([]);
    }

    if (platformVoucherIds) {
      try {
        const ids = platformVoucherIds.split(',');
        const founds = PLATFORM_VOUCHERS.filter((v: any) => ids.includes(v.id));
        setPlatformVouchers(founds);
      } catch (e) {
        console.log('Failed to parse platform vouchers', e);
      }
    }

    if (shopVoucherId) {
      try {
        const res = await apiClient.get('/api/vouchers');
        const vouchers = res.data?.data || res.data || [];
        const found = vouchers.find((v: any) => v.id === shopVoucherId);
        if (found) setShopVoucher(found);
      } catch (e) {
        console.log('Failed to fetch shop voucher', e);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      await Promise.all([fetchAddress(), fetchCart()]);
      setIsLoadingData(false);
    };
    loadData();
  }, [productId, quantity]);

  const totalQuantity = cartItems.reduce((sum, x) => sum + (x.quantity || 0), 0);
  const productPrice = cartItems.reduce((sum, x) => sum + (x.unitPrice || 0) * (x.quantity || 0), 0);
    
  let shippingFee = 0;
  if (shippingMethod === 'tietkiem') shippingFee = 16000;
  else if (shippingMethod === 'nhanh') shippingFee = 35700;
  else if (shippingMethod === 'hoatoc') shippingFee = 50000;
  // 'mienshi' => 0

  const shippingDiscount = shippingFee > 0 ? -Math.min(shippingFee, 19700) : 0;
  const shippingDiscount = 0;
  const insurancePrice = 579;
  const finalShipping = shippingFee + shippingDiscount; 
  
  const isFreeship = (v: any) => (v.code && v.code.includes('FREESHIP')) || (v.name && v.name.toLowerCase().includes('miễn phí'));

  let finalTotal = productPrice + finalShipping; 
  let totalSaved = Math.abs(shippingDiscount);
  
  if (shopVoucher) {
    if (shopVoucher.discountType === 'Percentage') {
      let discount = (finalTotal * shopVoucher.discountValue / 100);
      if (shopVoucher.maxDiscount) discount = Math.min(discount, shopVoucher.maxDiscount);
      finalTotal -= discount;
      totalSaved += discount;
    } else {
      finalTotal -= shopVoucher.discountValue;
      totalSaved += shopVoucher.discountValue;
    }
  }
  
  platformVouchers.forEach(pv => {
    if (isFreeship(pv)) {
      // Apply to shipping
      let sDiscount = pv.discountValue;
      if (pv.discountType === 'Percentage') {
        sDiscount = (finalShipping * pv.discountValue / 100);
        if (pv.maxDiscount) sDiscount = Math.min(sDiscount, pv.maxDiscount);
      }
      finalTotal -= sDiscount;
      totalSaved += sDiscount;
    } else {
      // Apply to total
      if (pv.discountType === 'Percentage') {
        let discount = (finalTotal * pv.discountValue / 100);
        if (pv.maxDiscount) discount = Math.min(discount, pv.maxDiscount);
        finalTotal -= discount;
        totalSaved += discount;
      } else {
        finalTotal -= pv.discountValue;
        totalSaved += pv.discountValue;
      }
    }
  });
  
  if (insuranceSelected) finalTotal += insurancePrice;
  finalTotal = Math.max(0, finalTotal);

  const savings = totalSaved;
  if (appliedVoucher) finalTotal -= appliedVoucher.discount;
  finalTotal = Math.max(0, finalTotal); // Ensure total doesn't go negative
  const savings = Math.abs(shippingDiscount) + (appliedVoucher?.discount || 0);

  useEffect(() => {
    const estimateShippingFee = async () => {
      if (!selectedAddress?.id || cartItems.length === 0) {
        setShippingDistanceKm(null);
        return;
      }

      try {
        setIsEstimatingShipping(true);
        const payload = {
          shippingAddressId: selectedAddress.id,
          items: cartItems.map(x => ({
            productId: x.productId,
            variantId: x.variantId,
            quantity: x.quantity,
          })),
        };

        const response = await apiClient.post('/api/orders/shipping-fee/estimate', payload);
        const result = response.data?.data || response.data;
        const nextShippingFee = Number(result?.shippingFee);
        const nextDistance = result?.distanceKm;

        if (Number.isFinite(nextShippingFee) && nextShippingFee >= 0) {
          setShippingFee(nextShippingFee);
        } else {
          setShippingFee(25000);
        }

        setShippingDistanceKm(typeof nextDistance === 'number' ? nextDistance : null);
      } catch (error) {
        console.log('Failed to estimate shipping fee:', error);
        setShippingFee(25000);
        setShippingDistanceKm(null);
      } finally {
        setIsEstimatingShipping(false);
      }
    };

    estimateShippingFee();
  }, [selectedAddress?.id, cartItems]);

  const handleCheckout = async () => {
    try {
      if (!selectedAddress) {
        Alert.alert("Lỗi", "Vui lòng thêm địa chỉ giao hàng trước khi thanh toán.");
        return;
      }
      
      if (!cartItems || cartItems.length === 0) {
        Alert.alert("Lỗi", "Giỏ hàng của bạn đang trống.");
        return;
      }

      setIsProcessing(true);

      const payload = {
        shippingAddressId: selectedAddress.id,
        paymentMethod: paymentMethod,
        items: cartItems.map((x) => ({
          productId: x.productId,
          variantId: x.variantId,
          quantity: x.quantity,
        })),
      };

      const orderRes = await apiClient.post('/api/orders', payload);
      const orderData = orderRes.data?.data || orderRes.data;
      const realOrderId = orderData.id || orderData.Id || 1;
      const realTotalAmount = orderData.totalAmount || orderData.TotalAmount || finalTotal;

      if (message.trim() && cartItems.length > 0) {
        // Try to send message to shop
        try {
          const shopId = cartItems[0].shopId || 1; 
          await sendMessage({
            receiverId: shopId, 
            content: message.trim(),
            orderId: realOrderId
          });
        } catch(e) {
          console.log("Could not send message to shop", e);
        }
      }

      if (paymentMethod === 'cod') {
        // order successful
        setActiveScreen('success');
      } else {
        const response = await apiClient.post('/api/payments/vietqr/create', {
          amount: realTotalAmount,
          orderId: realOrderId,
          currency: "VND",
          paymentMethod: "vietqr"
        });
        
        const vietqrPayload = response.data?.data || response.data;
        if (vietqrPayload && vietqrPayload.paymentUrl) {
          setPaymentUrl(vietqrPayload.paymentUrl);
          setActiveScreen('success'); 
        } else {
          throw new Error("Không thể lấy QR thanh toán từ server.");
        }
      }
    } catch (error: any) {
      Alert.alert("Lỗi thanh toán", "Không thể tạo giao dịch lúc này.");
      console.log("Lỗi chi tiết:", error?.response?.data || error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (activeScreen === 'address_selection') {
    return (
      <AddressSelectionPage 
        onBack={() => setActiveScreen('payment')}
        onSelectAddress={(address) => {
          setSelectedAddress(address);
          setActiveScreen('payment');
        }}
        onAddNewRequest={() => {
          setEditingAddressId(undefined);
          setActiveScreen('add_address');
        }}
        onEditRequest={(id) => {
          setEditingAddressId(id);
          setActiveScreen('add_address');
        }}
        currentAddressId={selectedAddress?.id}
      />
    );
  }

  if (activeScreen === 'add_address') {
    return (
      <AddAddressPage 
        addressId={editingAddressId}
        onBack={() => {
          setEditingAddressId(undefined);
          setActiveScreen('address_selection');
        }}
        onSuccess={() => {
          setEditingAddressId(undefined);
          // When address is successfully added/updated, we switch back to selection and re-fetch the list
          setActiveScreen('address_selection');
          fetchAddress();
        }}
      />
    );
  }

  if (activeScreen === 'success') {
    return (
      <OrderSuccessPage 
        isPendingPayment={paymentMethod === 'vietqr'}
        cartItems={cartItems}
        finalTotal={finalTotal}
        paymentUrl={paymentUrl}
      />
    );
  }

  if (isLoadingData) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#F83758" />
        <Text style={{ marginTop: 12, color: '#666' }}>Đang tải thông tin thanh toán...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={26} color="#F83758" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <PaymentAddressSection 
            address={selectedAddress} 
            onPress={() => setActiveScreen('address_selection')} 
          />
          
          <PaymentProductSection 
            insuranceSelected={insuranceSelected} 
            setInsuranceSelected={setInsuranceSelected}
            items={cartItems}
          />
          
          <PaymentShippingSection 
            shippingMethod={shippingMethod}
            onChangeShippingMethod={setShippingMethod}
            shippingFee={shippingFee}
            message={message}
            onChangeMessage={setMessage}
            shopVoucher={shopVoucher}
            onChangeShopVoucher={setShopVoucher}
          />

          {platformVouchers.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={{ fontSize: 14, color: '#333', marginBottom: 8, fontWeight: '500' }}>ShopeeLite Voucher</Text>
              {platformVouchers.map((pv, idx) => (
                <View key={pv.id} style={[styles.subtotalRow, { marginBottom: idx !== platformVouchers.length - 1 ? 6 : 0 }]}>
                  <Text style={[styles.subtotalLabel, { color: '#666', fontSize: 13 }]}>- {pv.name}</Text>
                  <Text style={[styles.subtotalValue, { color: '#EE4D2D', fontSize: 13 }]}>
                    {pv.discountType === 'Percentage' 
                      ? `-${pv.discountValue}%` 
                      : `-${pv.discountValue.toLocaleString('vi-VN')}đ`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {!!shippingDistanceKm && (
            <View style={styles.distanceHintBlock}>
              <Text style={styles.distanceHintText}>
                Quang duong giao hang: {shippingDistanceKm.toFixed(2)} km
              </Text>
            </View>
          )}

          <PaymentVoucherSection 
            orderAmount={productPrice + finalShipping + (insuranceSelected ? insurancePrice : 0)}
            onVoucherApplied={(discount, code, voucherId) => {
              setAppliedVoucher({ code, discount, voucherId });
            }}
            onVoucherRemoved={() => {
              setAppliedVoucher(null);
            }}
            appliedVoucher={appliedVoucher || undefined}
          />

          <View style={styles.sectionBlock}>
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Tổng số tiền ({totalQuantity || 0} sản phẩm)</Text>
              <Text style={styles.subtotalValue}>{finalTotal.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>

          <PaymentMethodSection 
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
          />

          <PaymentSummarySection 
            productPrice={productPrice}
            shippingFee={shippingFee}
            shippingDiscount={shippingDiscount}
            finalTotal={finalTotal}
            voucherDiscount={appliedVoucher?.discount}
          />

          <View style={{ height: 100 }} />
        </ScrollView>

        <PaymentBottomBar 
          finalTotal={finalTotal}
          savings={savings}
          onOrderPress={handleCheckout}
          loading={isProcessing || isEstimatingShipping}
        />

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
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionBlock: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontSize: 14,
    color: '#333',
  },
  subtotalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  distanceHintBlock: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  distanceHintText: {
    fontSize: 13,
    color: '#666',
  },
});
