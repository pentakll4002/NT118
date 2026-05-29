import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createReturnRequest } from '../../lib/returnApi';
import { getOrderDetail, OrderDetailResponse } from '../../lib/orderApi';
import { uploadImage } from '../../lib/shopApi';
import * as ImagePicker from 'expo-image-picker';

const REASONS = [
  'Hàng lỗi, không hoạt động',
  'Giao sai sản phẩm, sai màu/size',
  'Giao thiếu hàng',
  'Khác'
];

export default function ReturnRequestPage() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  
  const [reason, setReason] = useState(REASONS[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [description, setDescription] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderDetail(Number(orderId));
      setOrder(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (evidenceUrls.length >= 3) {
      Alert.alert('Thông báo', 'Bạn chỉ có thể tải lên tối đa 3 ảnh minh chứng.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      await uploadImageToServer(result.assets[0].uri);
    }
  };

  const uploadImageToServer = async (uri: string) => {
    try {
      setUploading(true);
      const url = await uploadImage(uri);
      if (url) {
        setEvidenceUrls(prev => [...prev, url]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setEvidenceUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reason) {
      Alert.alert('Thông báo', 'Vui lòng chọn lý do trả hàng.');
      return;
    }

    try {
      setSubmitting(true);
      await createReturnRequest(Number(orderId), {
        reason,
        description,
        evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined
      });
      
      Alert.alert(
        'Thành công', 
        'Yêu cầu trả hàng đã được gửi cho Người bán.',
        [{ text: 'OK', onPress: () => router.replace(`/return-status?orderId=${orderId}` as any) }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể gửi yêu cầu lúc này.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
        <Text style={styles.headerTitle}>Yêu cầu trả hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
          {order?.items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={{ uri: item.productImage || 'https://via.placeholder.com/60' }} style={styles.itemImg} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                <Text style={styles.itemQty}>Số lượng: {item.quantity}</Text>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Số tiền hoàn trả dự kiến:</Text>
            <Text style={styles.totalAmount}>₫{order?.order.totalAmount.toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lý do trả hàng <Text style={styles.required}>*</Text></Text>
          <View style={{ zIndex: 10 }}>
            <TouchableOpacity 
              style={styles.dropdownHeader} 
              onPress={() => setShowDropdown(!showDropdown)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownHeaderText}>{reason}</Text>
              <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
            </TouchableOpacity>
            
            {showDropdown && (
              <View style={styles.dropdownList}>
                {REASONS.map((r, index) => (
                  <TouchableOpacity 
                    key={r} 
                    style={[
                      styles.dropdownItem, 
                      reason === r && styles.dropdownItemSelected,
                      index === REASONS.length - 1 && { borderBottomWidth: 0 }
                    ]}
                    onPress={() => {
                      setReason(r);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, reason === r && { color: '#F73658', fontFamily: 'Montserrat_600SemiBold' }]}>{r}</Text>
                    {reason === r && <Ionicons name="checkmark" size={20} color="#F73658" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Mô tả rõ hơn về vấn đề bạn gặp phải..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ảnh minh chứng ({evidenceUrls.length}/3)</Text>
          <View style={styles.imageGrid}>
            {evidenceUrls.map((url, idx) => (
              <View key={idx} style={styles.imageWrapper}>
                <Image source={{ uri: url }} style={styles.evidenceImage} />
                <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(idx)}>
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            {evidenceUrls.length < 3 && (
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} disabled={uploading}>
                {uploading ? <ActivityIndicator color="#666" /> : <Ionicons name="camera-outline" size={32} color="#666" />}
                <Text style={styles.uploadText}>Thêm ảnh</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Gửi yêu cầu</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Montserrat_600SemiBold' },
  content: { padding: 12, gap: 12, paddingBottom: 30 },
  section: { backgroundColor: 'white', padding: 16, borderRadius: 8 },
  sectionTitle: { fontSize: 15, fontFamily: 'Montserrat_600SemiBold', marginBottom: 12 },
  required: { color: '#ef4444' },
  itemRow: { flexDirection: 'row', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 12 },
  itemImg: { width: 60, height: 60, borderRadius: 4, backgroundColor: '#eee' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontFamily: 'Montserrat_500Medium' },
  itemQty: { fontSize: 13, color: '#666', marginTop: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  totalLabel: { fontSize: 14, fontFamily: 'Montserrat_500Medium' },
  totalAmount: { fontSize: 16, fontFamily: 'Montserrat_700Bold', color: '#F73658' },
  dropdownHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, backgroundColor: '#fff',
  },
  dropdownHeaderText: { fontSize: 14, fontFamily: 'Montserrat_500Medium', color: '#333' },
  dropdownList: {
    marginTop: 4, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    backgroundColor: '#fff', overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  dropdownItemSelected: { backgroundColor: '#fff1f2' },
  dropdownItemText: { fontSize: 14, fontFamily: 'Montserrat_400Regular', color: '#333' },
  textArea: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12,
    minHeight: 100, textAlignVertical: 'top', fontFamily: 'Montserrat_400Regular'
  },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  imageWrapper: { width: 80, height: 80, borderRadius: 8, position: 'relative' },
  evidenceImage: { width: 80, height: 80, borderRadius: 8 },
  removeImgBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: 'white', borderRadius: 12 },
  uploadBtn: {
    width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center'
  },
  uploadText: { fontSize: 12, color: '#666', marginTop: 4, fontFamily: 'Montserrat_400Regular' },
  footer: { backgroundColor: 'white', padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  submitButton: { backgroundColor: '#F73658', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  submitText: { color: 'white', fontSize: 16, fontFamily: 'Montserrat_600SemiBold' }
});
