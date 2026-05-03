import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface PaymentMethodSectionProps {
  selectedMethod: 'cod' | 'vietqr';
  onSelectMethod: (method: 'cod' | 'vietqr') => void;
}

export default function PaymentMethodSection({ selectedMethod, onSelectMethod }: PaymentMethodSectionProps) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.rowItemPayment}>
        <Text style={styles.paymentTitleTitle}>Phương thức thanh toán</Text>
      </View>

      <TouchableOpacity style={styles.paymentMethodRow} onPress={() => onSelectMethod('cod')}>
        <View style={styles.paymentMethodLeft}>
          <Ionicons name="cash" size={24} color={selectedMethod === 'cod' ? "#F83758" : "#888"} />
          <Text style={styles.paymentMethodName}>  Thanh toán khi nhận hàng</Text>
        </View>
        <MaterialCommunityIcons 
          name={selectedMethod === 'cod' ? "check-circle" : "checkbox-blank-circle-outline"} 
          size={24} 
          color={selectedMethod === 'cod' ? "#F83758" : "#888"} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.paymentMethodRow} onPress={() => onSelectMethod('vietqr')}>
        <View style={styles.paymentMethodLeft}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color={selectedMethod === 'vietqr' ? "#F83758" : "#888"} />
          <Text style={styles.paymentMethodName}>  Thanh toán qua mã VietQR</Text>
        </View>
        <MaterialCommunityIcons 
          name={selectedMethod === 'vietqr' ? "check-circle" : "checkbox-blank-circle-outline"} 
          size={24} 
          color={selectedMethod === 'vietqr' ? "#F83758" : "#888"} 
        />
      </TouchableOpacity>

      {selectedMethod === 'vietqr' && (
        <View style={styles.paymentChild}>
           <View style={styles.spayBalanceRow}>
             <View style={styles.spayBalanceCol}>
               <Text style={styles.vnpayDesc}>Hỗ trợ chuyển khoản qua mọi ngân hàng.</Text>
               <Text style={styles.spayDiscount}>Mã QR sẽ hiển thị sau khi đặt hàng</Text>
             </View>
           </View>
        </View>
      )}
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
