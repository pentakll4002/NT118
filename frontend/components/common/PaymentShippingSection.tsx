import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function PaymentShippingSection() {
  return (
    <>
      {/* Voucher & Messages */}
      <View style={styles.sectionBlock}>
         <TouchableOpacity style={styles.rowItem}>
           <Text style={styles.rowLabel}>Voucher của Shop</Text>
           <View style={styles.rowRight}>
             <Text style={styles.rowValue}>Chọn hoặc nhập mã</Text>
             <Ionicons name="chevron-forward" size={16} color="#888" />
           </View>
         </TouchableOpacity>
         <View style={styles.divider} />
         <TouchableOpacity style={styles.rowItem}>
           <Text style={styles.rowLabel}>Lời nhắn cho Shop</Text>
           <View style={styles.rowRight}>
             <Text style={styles.rowValue}>Để lại lời nhắn</Text>
             <Ionicons name="chevron-forward" size={16} color="#888" />
           </View>
         </TouchableOpacity>
      </View>

      {/* Shipping */}
      <View style={styles.sectionBlock}>
         <View style={styles.rowItem}>
           <Text style={styles.shippingTitle}>Phương thức vận chuyển</Text>
           <TouchableOpacity style={styles.rowRight}>
             <Text style={styles.shippingMore}>Xem tất cả</Text>
             <Ionicons name="chevron-forward" size={16} color="#888" />
           </TouchableOpacity>
         </View>
         
         <View style={styles.shippingBox}>
            <View style={styles.shippingTopRow}>
              <View style={styles.shippingLeft}>
                <MaterialCommunityIcons name="truck-fast-outline" size={20} color="#009688" />
                <Text style={styles.shippingDate}>  22 Th04 - 23 Th04</Text>
              </View>
              <View style={styles.shippingRight}>
                <Text style={styles.shippingOldPrice}>35.700đ</Text>
                <Text style={styles.shippingCurrentPrice}>16.000đ</Text>
              </View>
            </View>
            <Text style={styles.shippingMethod}>Nhanh</Text>
         </View>

         <View style={styles.collectionPoint}>
            <View style={styles.collectionHeader}>
              <Text style={styles.collectionTitle}>Điểm nhận hàng • 22 Th04 - 24 Th04</Text>
              <Text style={styles.collectionPrice}>35.700đ</Text>
            </View>
            <Text style={styles.collectionAction}>Select Collection Point  <Ionicons name="chevron-forward" size={12} color="#F83758" /></Text>
         </View>
         
         <Text style={styles.shippingWarning}>Nhận tối đa 15.000đ nếu đơn hàng giao trễ</Text>
         <Text style={styles.inspectionText}>Được đồng kiểm <Ionicons name="help-circle-outline" size={14} color="#888" /></Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rowLabel: {
    fontSize: 14,
    color: '#333',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 13,
    color: '#888',
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 12,
  },
  shippingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  shippingMore: {
    fontSize: 13,
    color: '#888',
  },
  shippingBox: {
    borderWidth: 1,
    borderColor: '#009688',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#F0FBFA',
    marginTop: 12,
  },
  shippingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shippingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shippingDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  shippingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shippingOldPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  shippingCurrentPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  shippingMethod: {
    fontSize: 12,
    color: '#555',
    marginTop: 6,
    marginLeft: 26,
  },
  collectionPoint: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 4,
    padding: 12,
    marginTop: 12,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  collectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  collectionPrice: {
    fontSize: 13,
    color: '#000',
  },
  collectionAction: {
    fontSize: 12,
    color: '#F83758',
    marginTop: 8,
  },
  shippingWarning: {
    fontSize: 12,
    color: '#888',
    marginTop: 12,
  },
  inspectionText: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
});
