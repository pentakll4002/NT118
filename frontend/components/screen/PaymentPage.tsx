import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PaymentAddressSection, { UserAddressType } from '../common/PaymentAddressSection';
import PaymentProductSection, { CheckoutCartItem } from '../common/PaymentProductSection';
import PaymentShippingSection from '../common/PaymentShippingSection';
import PaymentMethodSection from '../common/PaymentMethodSection';
import PaymentSummarySection from '../common/PaymentSummarySection';
import PaymentBottomBar from '../common/PaymentBottomBar';
import AddressSelectionPage from './AddressSelectionPage';
import AddAddressPage from './AddAddressPage';
import { apiClient } from '../../lib/apiClient';

interface PaymentPageProps {
  onClose: () => void;
  totalAmount: number;
}

type ScreenState = 'payment' | 'address_selection' | 'add_address';

export default function PaymentPage({ onClose, totalAmount }: PaymentPageProps) {
  const [activeScreen, setActiveScreen] = useState<ScreenState>('payment');
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UserAddressType | null>(null);
  const [cartItems, setCartItems] = useState<CheckoutCartItem[]>([]);

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
    try {
      const response = await apiClient.get('/api/user/cart');
      const data = response.data?.data || response.data;
      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Failed to fetch cart:', error);
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchAddress();
    fetchCart();
  }, []);

  const totalQuantity = cartItems.reduce((sum, x) => sum + (x.quantity || 0), 0);
  const productPrice = cartItems.reduce((sum, x) => sum + (x.unitPrice || 0) * (x.quantity || 0), 0);
  const shippingFee = 35700;
  const shippingDiscount = -19700;
  const insurancePrice = 579;
  const finalShipping = shippingFee + shippingDiscount; 
  
  let finalTotal = productPrice + finalShipping; 
  if (insuranceSelected) finalTotal += insurancePrice;
  const savings = Math.abs(shippingDiscount) + 20000;

  const handleVNPayCheckout = async () => {
    try {
      if (!selectedAddress) {
        Alert.alert("Lỗi", "Vui lòng thêm địa chỉ giao hàng trước khi thanh toán.");
        return;
      }

      setIsProcessing(true);
      const response = await apiClient.post('/api/payments/vnpay/create', {
        amount: finalTotal,
        orderId: 1, // Mock
        currency: "VND",
        paymentMethod: "vnpay"
      });
      
      const payload = response.data?.data || response.data;
      if (payload && payload.paymentUrl) {
        await Linking.openURL(payload.paymentUrl);
        onClose();
      } else {
        throw new Error("Không thể lấy URL thanh toán từ server.");
      }
    } catch (error) {
      Alert.alert("Lỗi thanh toán", "Không thể tạo giao dịch VNPay lúc này.");
      console.log(error);
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
        onAddNewRequest={() => setActiveScreen('add_address')}
        currentAddressId={selectedAddress?.id}
      />
    );
  }

  if (activeScreen === 'add_address') {
    return (
      <AddAddressPage 
        onBack={() => setActiveScreen('address_selection')}
        onSuccess={() => {
          // When address is successfully added, we switch back to selection and re-fetch the list
          setActiveScreen('address_selection');
          fetchAddress();
        }}
      />
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
          
          <PaymentShippingSection />

          <View style={styles.sectionBlock}>
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Tổng số tiền ({totalQuantity || 0} sản phẩm)</Text>
              <Text style={styles.subtotalValue}>{finalTotal.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>

          <PaymentMethodSection />

          <PaymentSummarySection 
            productPrice={productPrice}
            shippingFee={shippingFee}
            shippingDiscount={shippingDiscount}
            finalTotal={finalTotal}
          />

          <View style={{ height: 100 }} />
        </ScrollView>

        <PaymentBottomBar 
          finalTotal={finalTotal}
          savings={savings}
          onOrderPress={handleVNPayCheckout}
          loading={isProcessing}
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
});
