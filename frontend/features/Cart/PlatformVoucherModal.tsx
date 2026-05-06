import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const PLATFORM_VOUCHERS = [
  { 
    id: 'V_SALE20', code: 'SALE20', name: 'Giảm 20% (Max 200k)', description: 'Áp dụng cho mọi đơn hàng',
    discountType: 'Percentage', discountValue: 20, maxDiscount: 200000, minOrderValue: 0
  },
  { 
    id: 'V_SAVE50K', code: 'SAVE50K', name: 'Giảm 50.000đ', description: 'Đơn tối thiểu 200k',
    discountType: 'FixedAmount', discountValue: 50000, minOrderValue: 200000
  },
  { 
    id: 'V_FREESHIP', code: 'FREESHIP', name: 'Miễn phí vận chuyển', description: 'Giảm tối đa 30k, Đơn tối thiểu 50k',
    discountType: 'FixedAmount', discountValue: 30000, minOrderValue: 50000
  },
  { 
    id: 'V_SUMMER15', code: 'SUMMER15', name: 'Giảm 15% (Max 150k)', description: 'Áp dụng cho mọi đơn hàng',
    discountType: 'Percentage', discountValue: 15, maxDiscount: 150000, minOrderValue: 0
  },
  { 
    id: 'V_WELCOME30K', code: 'WELCOME30K', name: 'Giảm 30.000đ', description: 'Đơn tối thiểu 150k',
    discountType: 'FixedAmount', discountValue: 30000, minOrderValue: 150000, isNewUser: true
  },
  { 
    id: 'V_LOYALTY10', code: 'LOYALTY10', name: 'Giảm 10%', description: 'Đơn tối thiểu 50k',
    discountType: 'Percentage', discountValue: 10, maxDiscount: undefined, minOrderValue: 50000
  },
];

interface PlatformVoucherModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyVouchers: (vouchers: any[]) => void;
  selectedVoucherCodes?: string[];
}

export default function PlatformVoucherModal({
  visible,
  onClose,
  onApplyVouchers,
  selectedVoucherCodes = [],
}: PlatformVoucherModalProps) {
  const [inputCode, setInputCode] = useState('');
  const [localSelected, setLocalSelected] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      const init = PLATFORM_VOUCHERS.filter(v => selectedVoucherCodes.includes(v.code));
      setLocalSelected(init);
    } else {
      setLocalSelected([]);
    }
  }, [visible, selectedVoucherCodes]);

  const isFreeship = (v: any) => (v.code && v.code.includes('FREESHIP')) || (v.name && v.name.toLowerCase().includes('miễn phí'));

  const handleToggle = (voucher: any) => {
    let newSelected = [...localSelected];
    const isFree = isFreeship(voucher);
    
    const idx = newSelected.findIndex(v => v.id === voucher.id);
    if (idx >= 0) {
      newSelected.splice(idx, 1);
    } else {
      if (isFree) {
        newSelected = newSelected.filter(v => !isFreeship(v));
      } else {
        newSelected = newSelected.filter(v => isFreeship(v));
      }
      newSelected.push(voucher);
    }
    setLocalSelected(newSelected);
  };

  const handleConfirm = () => {
    onApplyVouchers(localSelected);
    onClose();
  };

  const handleApplyInput = () => {
    if (inputCode.trim()) {
      const code = inputCode.trim().toUpperCase();
      const found = PLATFORM_VOUCHERS.find(v => v.code === code);
      if (found) {
        handleToggle(found);
        setInputCode('');
      } else {
        alert('Mã voucher không hợp lệ hoặc đã hết hạn.');
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>ShopeeLite Voucher</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã voucher"
              value={inputCode}
              onChangeText={setInputCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.applyBtn, !inputCode.trim() && styles.applyBtnDisabled]}
              onPress={handleApplyInput}
              disabled={!inputCode.trim()}
            >
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {PLATFORM_VOUCHERS.map((voucher) => {
              const isSelected = localSelected.some(v => v.id === voucher.id);
              return (
                <TouchableOpacity
                  key={voucher.id}
                  style={[styles.voucherCard, isSelected && styles.voucherCardSelected]}
                  onPress={() => handleToggle(voucher)}
                >
                  <View style={styles.voucherLeft}>
                    <Ionicons name="ticket-outline" size={32} color={isSelected ? '#EE4D2D' : '#888'} />
                  </View>
                  <View style={styles.voucherRight}>
                    <View style={styles.voucherHeader}>
                      <Text style={styles.voucherCode}>{voucher.code}</Text>
                      {voucher.isNewUser && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>Người Mới</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.voucherTitle}>{voucher.name}</Text>
                    <Text style={styles.voucherDesc}>{voucher.description}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={24} color="#EE4D2D" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            
            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={styles.bottomActions}>
            <View style={styles.selectedCountRow}>
              <Text style={styles.selectedCountText}>Đã chọn {localSelected.length} mã</Text>
            </View>
            <TouchableOpacity style={styles.confirmModalBtn} onPress={handleConfirm}>
              <Text style={styles.confirmModalText}>Đồng ý</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  applyBtn: {
    backgroundColor: '#EE4D2D',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  applyBtnDisabled: {
    backgroundColor: '#E5E7EB',
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  voucherCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  voucherCardSelected: {
    borderColor: '#EE4D2D',
    backgroundColor: '#FEF2F2',
  },
  voucherLeft: {
    width: 80,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  voucherRight: {
    flex: 1,
    padding: 12,
  },
  voucherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  voucherCode: {
    fontWeight: '700',
    fontSize: 14,
    color: '#111827',
    marginRight: 8,
  },
  tag: {
    backgroundColor: '#EE4D2D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  voucherTitle: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 4,
  },
  voucherDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  bottomActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCountRow: {
    flex: 1,
  },
  selectedCountText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  confirmModalBtn: {
    backgroundColor: '#EE4D2D',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 4,
  },
  confirmModalText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
