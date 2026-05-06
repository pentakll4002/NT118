import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../lib/apiClient';

interface ShopVoucherModalProps {
  visible: boolean;
  onClose: () => void;
  shopId?: number;
  mode?: 'claim' | 'select';
  onSelectVoucher?: (voucher: any | null) => void;
  selectedVoucherId?: number;
}

export default function ShopVoucherModal({ visible, onClose, shopId, mode = 'claim', onSelectVoucher, selectedVoucherId }: ShopVoucherModalProps) {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && vouchers.length === 0) {
      setLoading(true);
      apiClient.get('/api/vouchers')
        .then(res => {
          const data = res.data?.data || res.data || [];
          setVouchers(data);
        })
        .catch(err => console.log('Fetch vouchers failed', err))
        .finally(() => setLoading(false));
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Voucher của Shop</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {loading ? (
              <ActivityIndicator size="large" color="#EE4D2D" style={{ marginTop: 20 }} />
            ) : vouchers.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>Không có voucher nào khả dụng</Text>
            ) : (
              vouchers.map(v => {
                const isSelected = selectedVoucherId === v.id;
                return (
                  <View key={v.id} style={[styles.voucherItem, isSelected && styles.voucherItemSelected]}>
                    <View style={styles.voucherLeft}>
                      <Ionicons name="ticket-outline" size={32} color={isSelected ? '#EE4D2D' : '#888'} />
                    </View>
                    <View style={styles.voucherRight}>
                      <Text style={styles.voucherCode}>{v.code}</Text>
                      <Text style={styles.voucherName}>{v.name}</Text>
                      <Text style={styles.voucherDesc}>{v.description}</Text>
                    </View>
                    {mode === 'claim' ? (
                      <TouchableOpacity 
                        style={styles.saveBtn}
                        onPress={async () => {
                          try {
                            await apiClient.post(`/api/vouchers/${v.id}/claim`);
                            alert('Lưu voucher thành công!');
                          } catch(e: any) {
                            alert(e.response?.data?.message || 'Đã xảy ra lỗi khi lưu voucher');
                          }
                        }}
                      >
                        <Text style={styles.saveBtnText}>Lưu</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={isSelected ? styles.selectedBtn : styles.saveBtn}
                        onPress={() => onSelectVoucher && onSelectVoucher(v)}
                      >
                        <Text style={isSelected ? styles.selectedBtnText : styles.saveBtnText}>
                          {isSelected ? 'Đã chọn' : 'Dùng'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
            {mode === 'select' && (
              <TouchableOpacity 
                style={styles.clearVoucherBtn}
                onPress={() => onSelectVoucher && onSelectVoucher(null)}
              >
                <Text style={styles.clearVoucherText}>Bỏ chọn Voucher</Text>
              </TouchableOpacity>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  voucherItem: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  voucherLeft: {
    width: 80,
    height: '100%',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#EEE',
    borderStyle: 'dashed',
    minHeight: 80,
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
  saveBtn: {
    marginRight: 12,
    backgroundColor: '#EE4D2D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedBtn: {
    marginRight: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EE4D2D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  selectedBtnText: {
    color: '#EE4D2D',
    fontSize: 12,
    fontWeight: '600',
  },
  voucherItemSelected: {
    borderColor: '#EE4D2D',
    backgroundColor: '#FEF2F2',
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
