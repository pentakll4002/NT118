import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type CheckoutCartItem = {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  mainImageUrl?: string | null;
  variantName?: string | null;
  variantValue?: string | null;
};

interface PaymentProductSectionProps {
  insuranceSelected: boolean;
  setInsuranceSelected: (val: boolean) => void;
  items: CheckoutCartItem[];
}

export default function PaymentProductSection({ insuranceSelected, setInsuranceSelected, items }: PaymentProductSectionProps) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.shopHeader}>
        <View style={styles.mallBadge}><Text style={styles.mallText}>Yêu thích</Text></View>
        <Text style={styles.shopName}>Sản phẩm</Text>
      </View>
      {items.map((item) => (
        <View key={item.id} style={styles.productRow}>
          {item.mainImageUrl ? (
            <Image source={{ uri: item.mainImageUrl }} style={styles.productImage} />
          ) : (
            <Image source={require('../../assets/images/Group 34010.png')} style={styles.productImage} />
          )}
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>{item.productName}</Text>
            {(item.variantName || item.variantValue) ? (
              <Text style={styles.productVariant}>
                {[item.variantName, item.variantValue].filter(Boolean).join(': ')}
              </Text>
            ) : null}
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>
                {item.unitPrice.toLocaleString('vi-VN')}đ
              </Text>
              <Text style={styles.originalPrice} />
              <Text style={styles.quantity}>x{item.quantity}</Text>
            </View>
          </View>
        </View>
      ))}
      
      <View style={styles.insuranceRow}>
        <TouchableOpacity onPress={() => setInsuranceSelected(!insuranceSelected)}>
          <MaterialCommunityIcons name={insuranceSelected ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color={insuranceSelected ? "#F83758" : "#DDDDDD"} />
        </TouchableOpacity>
        <View style={styles.insuranceTextContainer}>
          <View style={styles.insuranceTitleRow}>
            <Text style={styles.insuranceTitle}>Bảo hiểm Thời trang</Text>
            <Text style={styles.insurancePrice}>579đ x1</Text>
          </View>
          <Text style={styles.insuranceDesc}>Bảo vệ sản phẩm được bảo hiểm khỏi thiệt hại do sự cố bất ngờ rủi ro. <Text style={styles.linkText}>Tìm hiểu thêm...</Text></Text>
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
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mallBadge: {
    backgroundColor: '#F83758',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    marginRight: 8,
  },
  mallText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  shopName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 4,
    backgroundColor: '#EEE',
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  productVariant: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  videoBadge: {
    borderWidth: 1,
    borderColor: '#F83758',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  videoBadgeText: {
    fontSize: 10,
    color: '#F83758',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F83758',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
    flex: 1,
  },
  quantity: {
    fontSize: 13,
    color: '#333',
  },
  insuranceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAFCFF',
    padding: 10,
    borderRadius: 4,
  },
  insuranceTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  insuranceTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  insuranceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  insurancePrice: {
    fontSize: 13,
    color: '#333',
  },
  insuranceDesc: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  linkText: {
    color: '#4392F9',
  },
});
