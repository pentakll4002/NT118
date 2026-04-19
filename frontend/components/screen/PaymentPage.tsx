import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PaymentAddressSection from '../common/PaymentAddressSection';
import PaymentProductSection from '../common/PaymentProductSection';
import PaymentShippingSection from '../common/PaymentShippingSection';
import PaymentShopeeVoucherSection from '../common/PaymentShopeeVoucherSection';
import PaymentMethodSection from '../common/PaymentMethodSection';
import PaymentSummarySection from '../common/PaymentSummarySection';
import PaymentBottomBar from '../common/PaymentBottomBar';

interface PaymentPageProps {
  onClose: () => void;
  totalAmount: number;
}

export default function PaymentPage({ onClose, totalAmount }: PaymentPageProps) {
  const [useCoins, setUseCoins] = useState(false);
  const [insuranceSelected, setInsuranceSelected] = useState(false);

  // Mock data calculations based on screenshots
  const productPrice = 69000;
  const shippingFee = 35700;
  const shippingDiscount = -19700;
  const insurancePrice = 579;
  const finalShipping = shippingFee + shippingDiscount; 
  
  let finalTotal = productPrice + finalShipping; 
  if (insuranceSelected) finalTotal += insurancePrice;
  const savings = Math.abs(shippingDiscount) + 20000;

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
          
          <PaymentAddressSection />
          
          <PaymentProductSection 
            insuranceSelected={insuranceSelected} 
            setInsuranceSelected={setInsuranceSelected} 
          />
          
          <PaymentShippingSection />

          <View style={styles.sectionBlock}>
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Tổng số tiền (1 sản phẩm)</Text>
              <Text style={styles.subtotalValue}>{finalTotal.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>

          <PaymentShopeeVoucherSection 
            useCoins={useCoins} 
            setUseCoins={setUseCoins} 
          />

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
          onOrderPress={onClose}
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
