import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '../../lib/apiClient';

export type ShippingMethod = 'mienshi' | 'nhanh' | 'tietkiem' | 'hoatoc';

interface PaymentShippingSectionProps {
  shippingMethod?: ShippingMethod;
  onChangeShippingMethod?: (method: ShippingMethod) => void;
  shippingFee?: number;
  message?: string;
  onChangeMessage?: (msg: string) => void;
  shopVoucher?: any | null;
  onChangeShopVoucher?: (voucher: any | null) => void;
}

export default function PaymentShippingSection({
  shippingMethod = 'nhanh',
  onChangeShippingMethod,
  shippingFee = 35700,
  message = '',
  onChangeMessage,
  shopVoucher = null,
  onChangeShopVoucher
}: PaymentShippingSectionProps) {
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  useEffect(() => {
    if (showVoucherModal && vouchers.length === 0) {
      setLoadingVouchers(true);
      apiClient.get('/api/vouchers')
        .then(res => {
          const data = res.data?.data || res.data || [];
          setVouchers(data);
        })
        .catch(err => console.log('Fetch vouchers failed', err))
        .finally(() => setLoadingVouchers(false));
    }
  }, [showVoucherModal]);

  const shippingOptions = [
    { id: 'mienshi', title: 'Miễn phí vận chuyển', price: 0, date: '25 Th05 - 28 Th05' },
    { id: 'tietkiem', title: 'Giao hàng Tiết Kiệm', price: 16000, date: '24 Th05 - 26 Th05' },
    { id: 'nhanh', title: 'Giao hàng Nhanh', price: 35700, date: '22 Th05 - 23 Th05' },
    { id: 'hoatoc', title: 'Giao Hỏa Tốc', price: 50000, date: 'Hôm nay' },
  ];

  const currentShipping = shippingOptions.find(o => o.id === shippingMethod) || shippingOptions[0];

  return (
    <>
      {/* Voucher & Messages */}
      <View style={styles.sectionBlock}>
         <TouchableOpacity style={styles.rowItem} onPress={() => setShowVoucherModal(true)}>
           <Text style={styles.rowLabel}>Voucher của Shop</Text>
           <View style={styles.rowRight}>
             <Text style={styles.rowValue}>{shopVoucher ? shopVoucher.code : 'Chọn hoặc nhập mã'}</Text>
             <Ionicons name="chevron-forward" size={16} color="#888" />
           </View>
         </TouchableOpacity>
         
         <View style={styles.divider} />
         
         <View style={styles.messageRow}>
           <Text style={styles.rowLabel}>Lời nhắn cho Shop</Text>
           <TextInput 
             style={styles.messageInput} 
             placeholder="Lưu ý cho người bán..."
             value={message}
             onChangeText={onChangeMessage}
           />
         </View>
      </View>

      {/* Shipping */}
      <View style={styles.sectionBlock}>
         <View style={styles.rowItem}>
           <Text style={styles.shippingTitle}>Phương thức vận chuyển</Text>
         </View>
         
         <TouchableOpacity style={styles.shippingBox} onPress={() => setShowShippingModal(true)}>
            <View style={styles.shippingTopRow}>
              <View style={styles.shippingLeft}>
                <MaterialCommunityIcons name="truck-fast-outline" size={20} color="#009688" />
                <Text style={styles.shippingDate}>  {currentShipping.date}</Text>
              </View>
              <View style={styles.shippingRight}>
                <Text style={styles.shippingCurrentPrice}>{currentShipping.price.toLocaleString('vi-VN')}đ</Text>
                <Ionicons name="chevron-forward" size={16} color="#888" style={{marginLeft: 4}} />
              </View>
            </View>
            <Text style={styles.shippingMethod}>{currentShipping.title}</Text>
         </TouchableOpacity>
         
         <Text style={styles.inspectionText}>Được đồng kiểm <Ionicons name="help-circle-outline" size={14} color="#888" /></Text>
      </View>

      {/* Shipping Modal */}
      <Modal visible={showShippingModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn phương thức vận chuyển</Text>
              <TouchableOpacity onPress={() => setShowShippingModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {shippingOptions.map(opt => (
                <TouchableOpacity 
                  key={opt.id} 
                  style={[styles.shippingOption, shippingMethod === opt.id && styles.shippingOptionSelected]}
                  onPress={() => {
                    onChangeShippingMethod?.(opt.id as ShippingMethod);
                    setShowShippingModal(false);
                  }}
                >
                  <View style={styles.shippingOptionLeft}>
                    <Text style={styles.shippingOptionTitle}>{opt.title}</Text>
                    <Text style={styles.shippingOptionDate}>Nhận hàng vào {opt.date}</Text>
                  </View>
                  <View style={styles.shippingOptionRight}>
                    <Text style={styles.shippingOptionPrice}>{opt.price.toLocaleString('vi-VN')}đ</Text>
                    {shippingMethod === opt.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#EE4D2D" style={{marginLeft: 8}} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Voucher Modal */}
      <Modal visible={showVoucherModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Voucher Shop</Text>
              <TouchableOpacity onPress={() => setShowVoucherModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {loadingVouchers ? (
                <ActivityIndicator size="large" color="#EE4D2D" style={{marginTop: 20}} />
              ) : vouchers.length === 0 ? (
                <Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>Không có voucher nào khả dụng</Text>
              ) : (
                vouchers.map(v => (
                  <TouchableOpacity 
                    key={v.id} 
                    style={[styles.voucherItem, shopVoucher?.id === v.id && styles.voucherItemSelected]}
                    onPress={() => {
                      onChangeShopVoucher?.(v);
                      setShowVoucherModal(false);
                    }}
                  >
                    <View style={styles.voucherLeft}>
                      <Ionicons name="ticket-outline" size={32} color={shopVoucher?.id === v.id ? '#EE4D2D' : '#888'} />
                    </View>
                    <View style={styles.voucherRight}>
                      <Text style={styles.voucherCode}>{v.code}</Text>
                      <Text style={styles.voucherName}>{v.name}</Text>
                      <Text style={styles.voucherDesc}>{v.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity 
                style={styles.clearVoucherBtn}
                onPress={() => {
                  onChangeShopVoucher?.(null);
                  setShowVoucherModal(false);
                }}
              >
                <Text style={styles.clearVoucherText}>Bỏ chọn Voucher</Text>
              </TouchableOpacity>
              <View style={{height: 40}} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    color: '#EE4D2D',
    marginRight: 4,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    color: '#333',
    marginLeft: 12,
  },
  shippingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  inspectionText: {
    fontSize: 12,
    color: '#888',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    minHeight: '40%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  shippingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  shippingOptionSelected: {
    backgroundColor: '#FEF2F2',
  },
  shippingOptionLeft: {
    flex: 1,
    paddingLeft: 8,
  },
  shippingOptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  shippingOptionDate: {
    fontSize: 12,
    color: '#888',
  },
  shippingOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  shippingOptionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  voucherItem: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  voucherItemSelected: {
    borderColor: '#EE4D2D',
    backgroundColor: '#FEF2F2',
  },
  voucherLeft: {
    width: 80,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#EEE',
    borderStyle: 'dashed',
  },
  voucherRight: {
    flex: 1,
    padding: 12,
  },
  voucherCode: {
    fontWeight: '700',
    fontSize: 14,
    color: '#111827',
  },
  voucherName: {
    fontSize: 13,
    color: '#374151',
    marginTop: 4,
  },
  voucherDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  clearVoucherBtn: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
  },
  clearVoucherText: {
    color: '#555',
    fontWeight: '500',
  },
});
