import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface PaymentShopeeVoucherSectionProps {
  useCoins: boolean;
  setUseCoins: (val: boolean) => void;
}

export default function PaymentShopeeVoucherSection({ useCoins, setUseCoins }: PaymentShopeeVoucherSectionProps) {
  return (
    <>
      <View style={styles.sectionBlock}>
        <TouchableOpacity style={styles.rowItem}>
           <View style={styles.voucherLeft}>
             <MaterialCommunityIcons name="ticket-percent-outline" size={24} color="#F83758" />
             <Text style={styles.voucherLabel}>  Shopee Voucher</Text>
           </View>
           <View style={styles.voucherRight}>
             <View style={styles.freeShipBadge}><Text style={styles.freeShipText}>Miễn Phí Vận Chu...</Text></View>
             <Ionicons name="chevron-forward" size={16} color="#888" />
           </View>
        </TouchableOpacity>
        <View style={styles.vipBanner}>
          <View style={styles.vipContent}>
            <Text style={styles.vipBrand}><Text style={styles.vipOrange}>Shopee</Text><Text style={styles.vipRed}>VIP</Text></Text>
            <Text style={styles.vipDesc}>Nhận Voucher <Text style={styles.vipBold}>giảm 35%</Text> cho lần đầu đăng ký</Text>
          </View>
          <TouchableOpacity style={styles.vipButton}>
            <Text style={styles.vipButtonText}>Mua Ngay</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.rowItem}>
           <View style={styles.voucherLeft}>
             <MaterialCommunityIcons name="alpha-s-circle" size={24} color="#F6A700" />
             <Text style={styles.coinLabel}>  Dùng 34500 Shopee Xu</Text>
           </View>
           <Switch 
             value={useCoins} 
             onValueChange={setUseCoins} 
             trackColor={{ false: "#E5E5E5", true: "#FFD1D1" }}
             thumbColor={useCoins ? "#F83758" : "#f4f3f4"}
           />
        </View>
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
  voucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  voucherRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freeShipBadge: {
    borderWidth: 1,
    borderColor: '#009688',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    marginRight: 6,
  },
  freeShipText: {
    fontSize: 10,
    color: '#009688',
  },
  vipBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E6',
    borderRadius: 4,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vipContent: {
    flex: 1,
  },
  vipBrand: {
    fontSize: 14,
    fontWeight: '800',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  vipOrange: {
    color: '#FA5A2A',
  },
  vipRed: {
    color: '#C62828',
  },
  vipDesc: {
    fontSize: 12,
    color: '#333',
  },
  vipBold: {
    fontWeight: '700',
  },
  vipButton: {
    backgroundColor: '#F83758',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  vipButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  coinLabel: {
    fontSize: 14,
    color: '#888',
  },
});
