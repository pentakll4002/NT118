import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PaymentSummarySectionProps {
  productPrice: number;
  shippingFee: number;
  shippingDiscount: number;
  finalTotal: number;
}

export default function PaymentSummarySection({ productPrice, shippingFee, shippingDiscount, finalTotal }: PaymentSummarySectionProps) {
  return (
    <>
      <View style={styles.sectionBlock}>
        <Text style={styles.detailSectionTitle}>Chi tiết thanh toán</Text>
        
        <View style={styles.detailListRow}>
          <Text style={styles.detailListLabel}>Tổng tiền hàng</Text>
          <Text style={styles.detailListValue}>{productPrice.toLocaleString('vi-VN')}đ</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.detailListLabel}>Tổng tiền phí vận chuyển</Text>
          <Text style={styles.detailListValue}>{shippingFee.toLocaleString('vi-VN')}đ</Text>
        </View>
        <View style={styles.detailListRow}>
          <Text style={styles.detailListLabel}>Giảm giá phí vận chuyển</Text>
          <Text style={styles.detailListDiscount}>{shippingDiscount.toLocaleString('vi-VN')}đ</Text>
        </View>
        <View style={[styles.detailListRow, { marginTop: 8 }]}>
          <Text style={styles.detailListLabelBig}>Tổng thanh toán</Text>
          <Text style={styles.detailListValueBig}>{finalTotal.toLocaleString('vi-VN')}đ</Text>
        </View>
      </View>

      <View style={styles.termsBlock}>
        <MaterialCommunityIcons name="file-document-outline" size={16} color="#888" />
        <Text style={styles.termsText}> Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo <Text style={styles.termsLink}>Điều khoản Shopee</Text></Text>
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
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailListLabel: {
    fontSize: 13,
    color: '#666',
  },
  detailListValue: {
    fontSize: 13,
    color: '#333',
  },
  detailListDiscount: {
    fontSize: 13,
    color: '#F83758',
  },
  detailListLabelBig: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  detailListValueBig: {
    fontSize: 16,
    color: '#F83758',
    fontWeight: '700',
  },
  termsBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    marginLeft: 8,
    lineHeight: 18,
  },
  termsLink: {
    color: '#4392F9',
  },
});
