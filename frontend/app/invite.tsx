import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiClient } from '../lib/apiClient';

export default function InviteHandler() {
  const router = useRouter();
  const { code } = useLocalSearchParams();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    if (!code) {
      Alert.alert('Lỗi', 'Không tìm thấy mã giới thiệu');
      router.replace('/');
      return;
    }

    const processReferral = async () => {
      try {
        const res = await apiClient.post('/api/missions/referral', { code });
        Alert.alert('Thành công', res.data.message || 'Bạn đã nhận thưởng 5,000 Xu!');
      } catch (e: any) {
        Alert.alert('Lỗi', e.response?.data?.message || 'Không thể áp dụng mã giới thiệu này');
      } finally {
        router.replace('/missions' as any);
      }
    };

    processReferral();
  }, [code]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#EE4D2D" />
      <Text style={{ marginTop: 20, color: '#333' }}>Đang xử lý mã mời của bạn...</Text>
    </View>
  );
}
