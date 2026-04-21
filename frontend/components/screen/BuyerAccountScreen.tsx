import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { clearAuthToken } from '../../lib/authToken';

const BuyerAccountScreen: React.FC = () => {
  const router = useRouter();

  const orderActions = [
    { key: 'confirm', icon: 'clipboard-check-outline', label: 'Chờ xác nhận', color: '#3b82f6', bg: '#eff6ff' },
    { key: 'pickup', icon: 'cube-outline', label: 'Chờ lấy hàng', color: '#f59e0b', bg: '#fffbeb' },
    { key: 'ship', icon: 'car-outline', label: 'Chờ giao hàng', color: '#10b981', bg: '#ecfdf5' },
    { key: 'review', icon: 'star-outline', label: 'Đánh giá', color: '#ef476f', bg: '#fff1f2' },
  ];

  const handleLogout = async () => {
    await clearAuthToken();
    router.replace('/login' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tài khoản</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={22} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>nguyenan110***</Text>
            <View style={styles.memberBadge}>
              <Ionicons name="medal-outline" size={12} color="#6b7280" />
              <Text style={styles.memberText}>THÀNH VIÊN BẠC</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ĐƠN MUA</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Xem lịch sử mua hàng</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.gridRow}>
            {orderActions.map((item) => (
              <TouchableOpacity key={item.key} style={styles.gridItem}>
                <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.gridText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile-edit' as any)}>
            <View style={styles.menuLeft}>
              <Ionicons name="create-outline" size={20} color="#3b82f6" />
              <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/seller-dashboard' as any)}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="storefront-outline" size={20} color="#ef476f" />
              <Text style={styles.menuText}>Kênh người bán</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TIỆN ÍCH</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/support-center' as any)}>
            <View style={styles.menuLeft}>
              <Ionicons name="help-circle-outline" size={20} color="#334155" />
              <Text style={styles.menuText}>Trung tâm hỗ trợ</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/platform-policy' as any)}>
            <View style={styles.menuLeft}>
              <Ionicons name="document-text-outline" size={20} color="#334155" />
              <Text style={styles.menuText}>Chính sách của nền tảng</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <Ionicons name="log-out-outline" size={20} color="#e11d48" />
              <Text style={[styles.menuText, styles.logoutText]}>Đăng xuất</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f8',
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
  },
  profileCard: {
    marginTop: 8,
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#60a5fa',
    backgroundColor: '#fca5a5',
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  memberBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
  },
  section: {
    marginTop: 10,
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  sectionLink: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingHorizontal: 12,
  },
  gridItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    width: '23%',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridText: {
    marginTop: 7,
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '600',
  },
  menuItem: {
    marginHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  logoutText: {
    color: '#e11d48',
  },
});

export default BuyerAccountScreen;
