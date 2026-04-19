import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function PaymentMethodSection() {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.rowItemPayment}>
        <Text style={styles.paymentTitleTitle}>Phương thức thanh toán</Text>
        <TouchableOpacity style={styles.rowRight}>
           <Text style={styles.shippingMore}>Xem tất cả</Text>
           <Ionicons name="chevron-forward" size={16} color="#888" />
         </TouchableOpacity>
      </View>

      <View style={styles.paymentMethodRow}>
        <View style={styles.paymentMethodLeft}>
          <Ionicons name="cash" size={24} color="#F83758" />
          <Text style={styles.paymentMethodName}>  Thanh toán khi nhận hàng</Text>
        </View>
        <MaterialCommunityIcons name="check-circle" size={24} color="#F83758" />
      </View>
      
      <View style={styles.paymentSPayHeader}>
        <Ionicons name="card" size={20} color="#F83758" />
        <Text style={styles.paymentSPayTitle}>  ShopeePay</Text>
      </View>

      <View style={styles.paymentChild}>
         <View style={styles.spayBalanceRow}>
           <View style={styles.spayBalanceCol}>
             <Text style={styles.paymentMethodName}>Số dư Ví ShopeePay</Text>
             <Text style={styles.spayDiscount}>Giảm thêm 100.000đ</Text>
           </View>
           <TouchableOpacity style={styles.activationButton}>
             <Text style={styles.activationText}>Kích hoạt ngay</Text>
           </TouchableOpacity>
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
  paymentSPayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentSPayTitle: {
    fontSize: 14,
    color: '#F83758',
    fontWeight: '500',
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
    color: '#F83758',
    borderWidth: 1,
    borderColor: '#F83758',
    borderRadius: 2,
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 4,
  },
  activationButton: {
    borderWidth: 1,
    borderColor: '#F83758',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activationText: {
    color: '#F83758',
    fontSize: 12,
  },
});
