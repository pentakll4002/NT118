import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { userApi } from '../lib/userApi';

export default function ReferralScreen() {
  const router = useRouter();
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await userApi.getProfile();
      // Use username as referral code if available, otherwise just use id (simulated)
      setCode(profile?.name || profile?.email?.split('@')[0] || 'SHOPEELITE');
    } catch (e) {
      setCode('SHOPEELITE');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Đã sao chép', 'Mã giới thiệu đã được lưu vào khay nhớ tạm.');
  };

  const handleShare = async () => {
    const inviteLink = `shopeelite://invite?code=${code}`;
    const message = `Tải ngay app ShopeeLite và nhập mã ${code} để nhận ngay 5,000 Xu miễn phí! Link: ${inviteLink}`;
    
    try {
      await Share.share({
        message,
      });
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể chia sẻ lúc này.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EE4D2D" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#EE4D2D', '#FF7337']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giới Thiệu Bạn Bè</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.illustration}>
          <Ionicons name="people-circle" size={100} color="#EE4D2D" />
        </View>
        <Text style={styles.title}>Mời bạn, nhận Xu khủng!</Text>
        <Text style={styles.subtitle}>
          Chia sẻ mã giới thiệu cho bạn bè. Khi họ tải ứng dụng và nhập mã, cả 2 sẽ nhận được 5,000 Xu vào ví!
        </Text>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Mã giới thiệu của bạn</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{code}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              <Ionicons name="copy-outline" size={20} color="#EE4D2D" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <LinearGradient colors={['#EE4D2D', '#FF7337']} style={styles.shareBtnGradient}>
            <Ionicons name="share-social-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.shareBtnText}>Chia sẻ mã ngay</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  content: { flex: 1, padding: 24, alignItems: 'center', marginTop: 20 },
  illustration: { marginBottom: 24, backgroundColor: '#FFF0ED', padding: 20, borderRadius: 100 },
  title: { fontSize: 24, fontWeight: '800', color: '#333', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  codeContainer: { width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 32 },
  codeLabel: { fontSize: 13, color: '#888', marginBottom: 8, textAlign: 'center', fontWeight: '600' },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  codeText: { fontSize: 28, fontWeight: '800', color: '#EE4D2D', letterSpacing: 2, marginRight: 16 },
  copyBtn: { padding: 8, backgroundColor: '#FFF0ED', borderRadius: 8 },
  shareBtn: { width: '100%', borderRadius: 12, overflow: 'hidden' },
  shareBtnGradient: { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
