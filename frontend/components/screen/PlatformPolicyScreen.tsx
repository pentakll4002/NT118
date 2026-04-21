import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const policyBlocks = [
  {
    title: '1. Chính sách thanh toán',
    content:
      'Nền tảng hỗ trợ thanh toán qua thẻ ngân hàng, ví điện tử và COD. Mọi giao dịch đều được mã hóa và lưu vết để đảm bảo an toàn.',
  },
  {
    title: '2. Chính sách đổi trả',
    content:
      'Người mua có thể gửi yêu cầu đổi trả trong vòng 7 ngày kể từ khi nhận hàng nếu sản phẩm lỗi hoặc sai mô tả.',
  },
  {
    title: '3. Chính sách bảo mật',
    content:
      'Thông tin cá nhân và lịch sử giao dịch chỉ được sử dụng để phục vụ vận hành đơn hàng, chăm sóc khách hàng và nâng cao trải nghiệm.',
  },
  {
    title: '4. Quy định cộng đồng',
    content:
      'Nghiêm cấm hành vi gian lận, đánh giá giả, ngôn từ phản cảm hoặc nội dung vi phạm pháp luật trên nền tảng.',
  },
];

const PlatformPolicyScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chính sách nền tảng</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Cập nhật gần nhất: 21/04/2026</Text>
          <Text style={styles.summaryText}>
            Chính sách được áp dụng cho toàn bộ người dùng và nhà bán hàng nhằm đảm bảo giao dịch minh bạch, an toàn.
          </Text>
        </View>

        {policyBlocks.map((block) => (
          <View key={block.title} style={styles.policyCard}>
            <Text style={styles.policyTitle}>{block.title}</Text>
            <Text style={styles.policyText}>{block.content}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f8' },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  headerPlaceholder: { width: 28 },
  content: { padding: 12 },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 10,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  summaryText: { marginTop: 6, fontSize: 13, color: '#4b5563', lineHeight: 20 },
  policyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 10,
  },
  policyTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  policyText: { marginTop: 6, fontSize: 13, color: '#4b5563', lineHeight: 20 },
});

export default PlatformPolicyScreen;
