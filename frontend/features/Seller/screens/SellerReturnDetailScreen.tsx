import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getSellerReturnDetail, processReturnRequest, ReturnRequestDTO, formatReturnStatus, getReturnStatusColor } from '../../../lib/returnApi';

export default function SellerReturnDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReturnRequestDTO | null>(null);
  const [processing, setProcessing] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  React.useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getSellerReturnDetail(Number(id));
      setData(res);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tải chi tiết');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (status: 'approved' | 'rejected', note?: string) => {
    if (status === 'rejected' && !note) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối.');
      return;
    }

    try {
      setProcessing(true);
      await processReturnRequest(Number(id), { status, sellerNote: note });
      Alert.alert('Thành công', `Đã ${status === 'approved' ? 'chấp nhận' : 'từ chối'} yêu cầu.`);
      setRejectModalVisible(false);
      fetchData();
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setProcessing(false);
    }
  };

  const confirmApprove = () => {
    Alert.alert(
      'Chấp nhận hoàn trả',
      'Đơn hàng sẽ chuyển sang trạng thái Đã hoàn trả. Vui lòng liên hệ Người mua để thỏa thuận phương thức chuyển tiền.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đồng ý', onPress: () => handleProcess('approved') }
      ]
    );
  };

  if (loading || !data) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F73658" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Yêu cầu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Trạng thái */}
        <View style={[styles.statusBox, { backgroundColor: getReturnStatusColor(data.status) + '15', borderColor: getReturnStatusColor(data.status) }]}>
          <Ionicons name={data.status === 'approved' ? 'checkmark-circle' : data.status === 'rejected' ? 'close-circle' : 'time'} size={24} color={getReturnStatusColor(data.status)} />
          <Text style={[styles.statusText, { color: getReturnStatusColor(data.status) }]}>Trạng thái: {formatReturnStatus(data.status)}</Text>
        </View>

        {/* Thông tin chung */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Mã đơn hàng</Text>
            <Text style={styles.value}>#{data.orderNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Người mua</Text>
            <Text style={styles.value}>{data.buyerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>SĐT / Email</Text>
            <Text style={styles.value}>{data.buyerEmail}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ngày yêu cầu</Text>
            <Text style={styles.value}>{new Date(data.createdAt).toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        {/* Chi tiết yêu cầu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết hoàn trả</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Lý do</Text>
            <Text style={styles.value}>{data.reason}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Số tiền hoàn</Text>
            <Text style={[styles.value, { color: '#F73658', fontFamily: 'Montserrat_700Bold' }]}>₫{data.refundAmount.toLocaleString('vi-VN')}</Text>
          </View>
          {data.description && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Mô tả của khách:</Text>
              <Text style={styles.descBox}>{data.description}</Text>
            </View>
          )}
        </View>

        {/* Sản phẩm */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm trong đơn</Text>
          {data.orderItems?.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={{ uri: item.productImage || 'https://via.placeholder.com/50' }} style={styles.itemImg} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                <Text style={styles.itemQty}>Số lượng: {item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Hình ảnh */}
        {data.evidenceUrls && data.evidenceUrls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ảnh minh chứng</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imageGrid}>
                {data.evidenceUrls.map((url, idx) => (
                  <Image key={idx} source={{ uri: url }} style={styles.evidenceImg} />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Lời nhắn của seller (nếu đã xử lý) */}
        {data.sellerNote && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú của bạn</Text>
            <Text style={styles.descBox}>{data.sellerNote}</Text>
          </View>
        )}
      </ScrollView>

      {/* Hành động (Chỉ hiện khi pending) */}
      {data.status === 'pending' && (
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => setRejectModalVisible(true)} disabled={processing}>
            <Text style={styles.rejectBtnText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={confirmApprove} disabled={processing}>
            {processing ? <ActivityIndicator color="white" /> : <Text style={styles.approveBtnText}>Đồng ý hoàn trả</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Modal từ chối */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Từ chối hoàn trả</Text>
            <Text style={styles.modalSub}>Vui lòng nhập lý do từ chối để Người mua biết.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập lý do..."
              multiline
              numberOfLines={4}
              value={rejectReason}
              onChangeText={setRejectReason}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setRejectModalVisible(false)}>
                <Text style={styles.modalBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#ef4444' }]} 
                onPress={() => handleProcess('rejected', rejectReason)}
                disabled={processing}
              >
                {processing ? <ActivityIndicator color="white" /> : <Text style={[styles.modalBtnText, { color: 'white' }]}>Xác nhận từ chối</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Montserrat_600SemiBold' },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  statusBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 15, fontFamily: 'Montserrat_600SemiBold' },
  section: { backgroundColor: 'white', padding: 16, borderRadius: 8, elevation: 1 },
  sectionTitle: { fontSize: 15, fontFamily: 'Montserrat_600SemiBold', marginBottom: 12, color: '#111' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 13, color: '#666', fontFamily: 'Montserrat_400Regular' },
  value: { fontSize: 14, color: '#333', fontFamily: 'Montserrat_500Medium', flex: 1, textAlign: 'right' },
  descBox: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 6, marginTop: 4, fontSize: 13, fontFamily: 'Montserrat_400Regular', color: '#444' },
  itemRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 12, marginBottom: 12 },
  itemImg: { width: 50, height: 50, borderRadius: 4, backgroundColor: '#eee' },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  itemName: { fontSize: 13, fontFamily: 'Montserrat_500Medium', color: '#333' },
  itemQty: { fontSize: 12, color: '#666', marginTop: 4 },
  imageGrid: { flexDirection: 'row', gap: 12 },
  evidenceImg: { width: 100, height: 100, borderRadius: 8, backgroundColor: '#eee' },
  footer: { flexDirection: 'row', padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee', gap: 12 },
  btn: { flex: 1, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  rejectBtn: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ef4444' },
  rejectBtnText: { color: '#ef4444', fontFamily: 'Montserrat_600SemiBold', fontSize: 15 },
  approveBtn: { backgroundColor: '#10b981' },
  approveBtnText: { color: 'white', fontFamily: 'Montserrat_600SemiBold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontFamily: 'Montserrat_600SemiBold', marginBottom: 8 },
  modalSub: { fontSize: 13, color: '#666', fontFamily: 'Montserrat_400Regular', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, minHeight: 100, textAlignVertical: 'top', fontFamily: 'Montserrat_400Regular' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtn: { flex: 1, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  modalBtnText: { color: '#333', fontFamily: 'Montserrat_600SemiBold' }
});
