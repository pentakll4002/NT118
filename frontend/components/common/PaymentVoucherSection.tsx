import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '../../lib/apiClient';

interface PaymentVoucherSectionProps {
  orderAmount: number;
  onVoucherApplied: (discount: number, voucherCode: string, voucherId: number) => void;
  onVoucherRemoved: () => void;
  appliedVoucher?: {
    code: string;
    discount: number;
    voucherId: number;
  };
}

export default function PaymentVoucherSection({ 
  orderAmount, 
  onVoucherApplied, 
  onVoucherRemoved, 
  appliedVoucher 
}: PaymentVoucherSectionProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã voucher');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/api/payments/apply-voucher', {
        code: voucherCode.trim(),
        orderAmount: orderAmount,
      });

      const result = response.data;
      if (result.discount !== undefined && result.voucher?.id) {
        onVoucherApplied(result.discount, result.code, result.voucher.id);
        setVoucherCode('');
        setShowInput(false);
        Alert.alert('Thành công', `Áp dụng giảm ${result.discount.toLocaleString('vi-VN')}đ`);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Voucher không hợp lệ';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    onVoucherRemoved();
  };

  return (
    <View style={styles.sectionBlock}>
      {appliedVoucher ? (
        <View style={styles.appliedVoucherContainer}>
          <View style={styles.appliedVoucherContent}>
            <MaterialCommunityIcons name="ticket-confirmation" size={24} color="#008B74" />
            <View style={styles.appliedVoucherText}>
              <Text style={styles.appliedVoucherCode}>{appliedVoucher.code}</Text>
              <Text style={styles.appliedVoucherDiscount}>
                Giảm {appliedVoucher.discount.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleRemoveVoucher}>
            <Text style={styles.removeVoucherText}>Bỏ</Text>
          </TouchableOpacity>
        </View>
      ) : showInput ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.voucherInput}
            placeholder="Nhập mã voucher"
            placeholderTextColor="#999"
            value={voucherCode}
            onChangeText={setVoucherCode}
            editable={!loading}
            maxLength={50}
          />
          <TouchableOpacity 
            style={[styles.applyButton, loading && styles.applyButtonDisabled]}
            onPress={handleApplyVoucher}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => {
              setShowInput(false);
              setVoucherCode('');
            }}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.voucherRowItem}
          onPress={() => setShowInput(true)}
        >
          <View style={styles.voucherLeft}>
            <MaterialCommunityIcons name="ticket-percent" size={24} color="#F83758" />
            <Text style={styles.voucherLabel}>Mã voucher</Text>
          </View>
          <Text style={styles.voucherPlaceholder}>Nhập mã →</Text>
        </TouchableOpacity>
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
  voucherRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  voucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  voucherPlaceholder: {
    fontSize: 13,
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voucherInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  applyButton: {
    backgroundColor: '#F83758',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: '500',
    fontSize: 13,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#999',
    fontWeight: '500',
    fontSize: 13,
  },
  appliedVoucherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCECE7',
  },
  appliedVoucherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedVoucherText: {
    marginLeft: 12,
  },
  appliedVoucherCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#008B74',
  },
  appliedVoucherDiscount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  removeVoucherText: {
    color: '#F83758',
    fontWeight: '500',
    fontSize: 13,
  },
});
