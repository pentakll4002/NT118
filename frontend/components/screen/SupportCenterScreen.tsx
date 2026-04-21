import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const faqItems = [
  {
    question: 'Làm sao để theo dõi đơn hàng đã đặt?',
    answer: 'Bạn vào mục Đơn mua > chọn đơn hàng cần xem để theo dõi trạng thái vận chuyển theo thời gian thực.',
  },
  {
    question: 'Khi nào tôi được hoàn tiền?',
    answer: 'Hoàn tiền thường được xử lý trong 1-3 ngày làm việc sau khi đơn hủy hoặc trả hàng thành công.',
  },
  {
    question: 'Tôi liên hệ hỗ trợ bằng cách nào?',
    answer: 'Bạn có thể chat trực tiếp với CSKH 24/7 hoặc gọi hotline 1900 1234 để được hỗ trợ nhanh.',
  },
];

const SupportCenterScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trung tâm hỗ trợ</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Chúng tôi luôn sẵn sàng hỗ trợ</Text>
          <Text style={styles.heroText}>
            Nếu bạn gặp vấn đề với đơn hàng, thanh toán hoặc tài khoản, hãy chọn một kênh bên dưới để được hỗ trợ ngay.
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#3b82f6" />
            <Text style={styles.actionTitle}>Chat với CSKH</Text>
            <Text style={styles.actionSubtitle}>Phản hồi trong vài phút</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="call-outline" size={22} color="#10b981" />
            <Text style={styles.actionTitle}>Gọi hotline</Text>
            <Text style={styles.actionSubtitle}>1900 1234</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
          {faqItems.map((item) => (
            <View key={item.question} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>
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
  content: { padding: 12, gap: 10 },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
  },
  heroTitle: { fontSize: 17, fontWeight: '700', color: '#1f2937' },
  heroText: { marginTop: 6, fontSize: 13, lineHeight: 20, color: '#4b5563' },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  actionTitle: { marginTop: 8, fontSize: 14, fontWeight: '700', color: '#1f2937' },
  actionSubtitle: { marginTop: 2, fontSize: 12, color: '#6b7280' },
  section: { marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 8,
  },
  faqQuestion: { fontSize: 14, fontWeight: '700', color: '#111827' },
  faqAnswer: { marginTop: 6, fontSize: 13, lineHeight: 20, color: '#4b5563' },
});

export default SupportCenterScreen;
