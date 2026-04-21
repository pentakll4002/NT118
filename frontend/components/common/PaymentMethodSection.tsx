import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function PaymentMethodSection() {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.rowItemPayment}>
        <Text style={styles.paymentTitleTitle}>Phương thức thanh toán</Text>
      </View>

      <View style={styles.paymentMethodRow}>
        <View style={styles.paymentMethodLeft}>
          <Ionicons name="cash" size={24} color="#888" />
          <Text style={styles.paymentMethodName}>  Thanh toán khi nhận hàng</Text>
        </View>
        <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="#888" />
      </View>
      
      <View style={styles.paymentMethodRow}>
        <View style={styles.paymentMethodLeft}>
          <MaterialCommunityIcons name="credit-card-outline" size={24} color="#F83758" />
          <Text style={styles.paymentMethodName}>  VNPay (Ví điện tử / Thẻ ATM)</Text>
        </View>
        <MaterialCommunityIcons name="check-circle" size={24} color="#F83758" />
      </View>

      <View style={styles.paymentChild}>
         <View style={styles.spayBalanceRow}>
           <View style={styles.spayBalanceCol}>
             <Text style={styles.vnpayDesc}>Thanh toán an toàn qua cổng VNPay.</Text>
             <Text style={styles.spayDiscount}>Mở app ngân hàng để quét mã QR</Text>
           </View>
         </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowItemPayment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentTitleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shippingMore: {
    fontSize: 13,
    color: '#888',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodName: {
    fontSize: 13,
    color: '#333',
  },
  vnpayDesc: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  paymentChild: {
    marginLeft: 28,
    borderLeftWidth: 1,
    borderLeftColor: '#F83758',
    paddingLeft: 12,
  },
  spayBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spayBalanceCol: {},
  spayDiscount: {
    fontSize: 10,
    color: '#009688',
    borderWidth: 1,
    borderColor: '#009688',
    borderRadius: 2,
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 4,
  },
});
