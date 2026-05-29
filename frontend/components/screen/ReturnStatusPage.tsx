import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getReturnRequest, ReturnRequestDTO, formatReturnStatus, getReturnStatusColor } from '../../lib/returnApi';

export default function ReturnStatusPage() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReturnRequestDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (orderId) {
      fetchData();
    }
  }, [orderId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getReturnRequest(Number(orderId));
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông tin.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F73658" />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error || 'Không tìm thấy yêu cầu'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Trả hàng / Hoàn tiền</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Trạng thái */}
        <View style={styles.statusCard}>
          <Ionicons 
            name={data.status === 'approved' ? 'checkmark-circle' : data.status === 'rejected' ? 'close-circle' : 'time'} 
            size={48} 
            color={getReturnStatusColor(data.status)} 
          />
          <Text style={[styles.statusText, { color: getReturnStatusColor(data.status) }]}>
            {formatReturnStatus(data.status)}
          </Text>
          <Text style={styles.dateText}>Cập nhật lần cuối: {new Date(data.updatedAt).toLocaleString('vi-VN')}</Text>
        </View>

        {/* Cảnh báo / Hướng dẫn */}
        {data.status === 'approved' && (
          <View style={[styles.alertBox, { backgroundColor: '#d1fae5', borderColor: '#10b981' }]}>
            <Ionicons name="information-circle" size={20} color="#059669" />
            <Text style={[styles.alertText, { color: '#065f46' }]}>
              Người bán đã đồng ý hoàn trả. Vui lòng liên hệ người bán qua chat để thỏa thuận phương thức nhận lại tiền.
            </Text>
          </View>
        )}

        {data.status === 'rejected' && (
          <View style={[styles.alertBox, { backgroundColor: '#fee2e2', borderColor: '#ef4444' }]}>
            <Ionicons name="information-circle" size={20} color="#b91c1c" />
            <Text style={[styles.alertText, { color: '#991b1b' }]}>
              Lý do từ chối: {data.sellerNote || 'Không có lý do được cung cấp.'}
            </Text>
          </View>
        )}

        {data.status === 'pending' && (
          <View style={[styles.alertBox, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
            <Ionicons name="information-circle" size={20} color="#b45309" />
            <Text style={[styles.alertText, { color: '#92400e' }]}>
              Yêu cầu của bạn đang chờ người bán phản hồi.
            </Text>
          </View>
        )}

        {/* Thông tin yêu cầu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin yêu cầu</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Số tiền hoàn dự kiến</Text>
            <Text style={styles.amount}>₫{data.refundAmount.toLocaleString('vi-VN')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Lý do</Text>
            <Text style={styles.value}>{data.reason}</Text>
          </View>
          {data.description && (
            <View style={styles.row}>
              <Text style={styles.label}>Mô tả</Text>
              <Text style={styles.value}>{data.description}</Text>
            </View>
          )}
        </View>

        {/* Ảnh minh chứng */}
        {data.evidenceUrls && data.evidenceUrls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ảnh minh chứng</Text>
            <View style={styles.imageGrid}>
              {data.evidenceUrls.map((url, idx) => (
                <Image key={idx} source={{ uri: url }} style={styles.evidenceImg} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Montserrat_600SemiBold' },
  content: { padding: 12, gap: 12 },
  statusCard: { 
    backgroundColor: 'white', padding: 24, borderRadius: 12, 
    alignItems: 'center', justifyContent: 'center', gap: 8 
  },
  statusText: { fontSize: 20, fontFamily: 'Montserrat_700Bold' },
  dateText: { fontSize: 13, color: '#666', fontFamily: 'Montserrat_400Regular' },
  alertBox: { 
    flexDirection: 'row', padding: 16, borderRadius: 8, borderWidth: 1, gap: 8 
  },
  alertText: { flex: 1, fontSize: 14, fontFamily: 'Montserrat_500Medium', lineHeight: 20 },
  section: { backgroundColor: 'white', padding: 16, borderRadius: 8 },
  sectionTitle: { fontSize: 16, fontFamily: 'Montserrat_600SemiBold', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#666', fontFamily: 'Montserrat_400Regular', flex: 1 },
  value: { fontSize: 14, color: '#333', fontFamily: 'Montserrat_500Medium', flex: 2, textAlign: 'right' },
  amount: { fontSize: 16, color: '#F73658', fontFamily: 'Montserrat_700Bold' },
  imageGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  evidenceImg: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee' },
  errorText: { fontSize: 16, color: '#333', fontFamily: 'Montserrat_500Medium', marginTop: 12, textAlign: 'center' },
  backBtn: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#F73658', borderRadius: 8 },
  backBtnText: { color: 'white', fontFamily: 'Montserrat_600SemiBold' }
});
