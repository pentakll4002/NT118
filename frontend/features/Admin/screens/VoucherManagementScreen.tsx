import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, AdminVoucherDTO, CreateVoucherRequest } from '@/lib/adminApi';

const VoucherManagementScreen: React.FC = () => {
  const [vouchers, setVouchers] = useState<AdminVoucherDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<AdminVoucherDTO | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchVouchers = useCallback(async () => {
    try {
      const data = await adminApi.getVouchers();
      setVouchers(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải voucher');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVouchers();
  }, [fetchVouchers]);

  const handleOpenModal = (voucher?: AdminVoucherDTO) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setCode(voucher.code);
      setName(voucher.name);
      setDiscountType(voucher.discountType);
      setDiscountValue(voucher.discountValue.toString());
      setMinOrderValue(voucher.minOrderValue?.toString() || '');
      setUsageLimit(voucher.usageLimit?.toString() || '');
      setIsActive(voucher.isActive);
    } else {
      setEditingVoucher(null);
      setCode('');
      setName('');
      setDiscountType('percentage');
      setDiscountValue('');
      setMinOrderValue('');
      setUsageLimit('');
      setIsActive(true);
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!code.trim() || !name.trim() || !discountValue.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ các trường bắt buộc');
      return;
    }

    try {
      const payload: CreateVoucherRequest = {
        code: code.toUpperCase(),
        name,
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        minOrderValue: parseFloat(minOrderValue) || undefined,
        usageLimit: parseInt(usageLimit) || undefined,
        startDate: new Date().toISOString(), // Default to now
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default to 30 days later
        isActive,
      };

      if (editingVoucher) {
        await adminApi.updateVoucher(editingVoucher.id, payload);
        Alert.alert('Thành công', 'Cập nhật voucher thành công');
      } else {
        await adminApi.createVoucher(payload);
        Alert.alert('Thành công', 'Tạo voucher thành công');
      }
      setModalVisible(false);
      fetchVouchers();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu voucher');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa voucher này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteVoucher(id);
              fetchVouchers();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa voucher');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4392F9" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Voucher</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {vouchers.map((item) => (
          <View key={item.id} style={styles.voucherCard}>
            <View style={styles.voucherLeft}>
              <View style={[styles.iconContainer, { backgroundColor: item.isActive ? '#eef2ff' : '#f3f4f6' }]}>
                <Ionicons name="ticket-outline" size={24} color={item.isActive ? '#4392F9' : '#9ca3af'} />
              </View>
            </View>
            <View style={styles.voucherRight}>
              <View style={styles.voucherHeader}>
                <Text style={styles.voucherCode}>{item.code}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#dcfce7' : '#fee2e2' }]}>
                  <Text style={[styles.statusText, { color: item.isActive ? '#166534' : '#991b1b' }]}>
                    {item.isActive ? 'Đang chạy' : 'Tạm dừng'}
                  </Text>
                </View>
              </View>
              <Text style={styles.voucherName}>{item.name}</Text>
              <Text style={styles.voucherInfo}>
                {item.discountType === 'percentage' ? `Giảm ${item.discountValue}%` : `Giảm ${formatCurrency(item.discountValue)}`}
                {item.minOrderValue ? ` • Đơn từ ${formatCurrency(item.minOrderValue)}` : ''}
              </Text>
              <Text style={styles.voucherStats}>
                Đã dùng: {item.usedCount} {item.usageLimit ? `/ ${item.usageLimit}` : ''}
              </Text>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenModal(item)}>
                  <Ionicons name="pencil-outline" size={20} color="#3498db" />
                  <Text style={styles.actionText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                  <Text style={[styles.actionText, { color: '#e74c3c' }]}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        {vouchers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Chưa có voucher nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingVoucher ? 'Sửa Voucher' : 'Tạo Voucher hệ thống'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Mã Voucher</Text>
                <TextInput
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                  placeholder="Ví dụ: SUMMER2026"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tên chương trình</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ví dụ: Giảm giá mùa hè"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Loại giảm giá</Text>
                  <View style={styles.typeSelector}>
                    <TouchableOpacity
                      style={[styles.typeBtn, discountType === 'percentage' && styles.typeBtnActive]}
                      onPress={() => setDiscountType('percentage')}
                    >
                      <Text style={[styles.typeBtnText, discountType === 'percentage' && styles.typeBtnTextActive]}>%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.typeBtn, discountType === 'fixed_amount' && styles.typeBtnActive]}
                      onPress={() => setDiscountType('fixed_amount')}
                    >
                      <Text style={[styles.typeBtnText, discountType === 'fixed_amount' && styles.typeBtnTextActive]}>VNĐ</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={[styles.formGroup, { flex: 1.5 }]}>
                  <Text style={styles.label}>Giá trị giảm</Text>
                  <TextInput
                    style={styles.input}
                    value={discountValue}
                    onChangeText={setDiscountValue}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Đơn tối thiểu (VNĐ)</Text>
                <TextInput
                  style={styles.input}
                  value={minOrderValue}
                  onChangeText={setMinOrderValue}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Giới hạn sử dụng (Lượt)</Text>
                <TextInput
                  style={styles.input}
                  value={usageLimit}
                  onChangeText={setUsageLimit}
                  keyboardType="numeric"
                  placeholder="Để trống nếu không giới hạn"
                />
              </View>

              <View style={styles.switchGroup}>
                <Text style={styles.label}>Kích hoạt voucher</Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                  thumbColor={isActive ? '#3b82f6' : '#f3f4f6'}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Lưu Voucher</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voucherCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  voucherLeft: {
    width: 70,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voucherRight: {
    flex: 1,
    padding: 16,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  voucherName: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 4,
  },
  voucherInfo: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  voucherStats: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3498db',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7f8c8d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#edf2f7',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: '#2c3e50',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  typeBtn: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  typeBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  typeBtnTextActive: {
    color: '#3498db',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: '#3498db',
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default VoucherManagementScreen;
