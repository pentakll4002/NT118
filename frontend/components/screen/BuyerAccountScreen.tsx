import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { clearAuthToken } from '../../lib/authToken';

import { userApi, UserProfileDTO } from '../../lib/userApi';
import { getOrderStats, OrderStat } from '../../lib/orderApi';

import { useFocusEffect } from '@react-navigation/native';

const BuyerAccountScreen: React.FC = () => {
  const router = useRouter();
  const [profile, setProfile] = React.useState<UserProfileDTO | null>(null);
  const [orderStats, setOrderStats] = React.useState<OrderStat[]>([]);

  const fetchData = async () => {
    try {
      const [profileData, statsData] = await Promise.all([
        userApi.getProfile(),
        getOrderStats()
      ]);
      setProfile(profileData);
      setOrderStats(statsData);
    } catch (error) {
      console.error('Failed to fetch account data:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const orderActions = [
    { key: 'confirm', icon: 'clipboard-outline', label: 'Chờ xác nhận', color: '#3b82f6', bg: '#eff6ff', status: 'pending' },
    { key: 'pickup', icon: 'cube-outline', label: 'Chờ lấy hàng', color: '#f59e0b', bg: '#fffbeb', status: 'confirmed' },
    { key: 'ship', icon: 'car-outline', label: 'Chờ giao hàng', color: '#10b981', bg: '#ecfdf5', status: 'shipping' },
    { key: 'review', icon: 'star-outline', label: 'Đánh giá', color: '#ef476f', bg: '#fff1f2', status: 'delivered' },
  ];

  const handleLogout = () => {
    require('react-native').Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await clearAuthToken();
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tài khoản</Text>
          <TouchableOpacity onPress={() => router.push('/profile-view' as any)}>
            <Ionicons name="settings-outline" size={22} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 32 }} />
            ) : (
              <Ionicons name="person" size={32} color="#cbd5e1" />
            )}
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile?.name || 'Người dùng'}</Text>
            <Text style={styles.email}>{profile?.email || 'Chưa cập nhật email'}</Text>
            <View style={styles.memberBadge}>
              <Ionicons name="medal-outline" size={12} color="#F73658" />
              <Text style={styles.memberText}>THÀNH VIÊN</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ĐƠN MUA</Text>
            <TouchableOpacity onPress={() => router.push('/orders' as any)}>
              <Text style={styles.sectionLink}>Xem lịch sử mua hàng</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.gridRow}>
            {orderActions.map((item) => {
              const stat = orderStats.find(s => s.status === item.status);
              const count = stat ? stat.count : 0;
              
              return (
                <TouchableOpacity 
                  key={item.key} 
                  style={styles.gridItem}
                  onPress={() => router.push({ pathname: '/orders' as any, params: { status: item.status } })}
                >
                  <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                    {count > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.gridText}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile-view' as any)}>
            <View style={styles.menuLeft}>
              <Ionicons name="person-outline" size={20} color="#3b82f6" />
              <Text style={styles.menuText}>Thông tin cá nhân</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/product-history' as any)}>
            <View style={styles.menuLeft}>
              <Ionicons name="time-outline" size={20} color="#6366f1" />
              <Text style={styles.menuText}>Sản phẩm đã xem</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/followed-shops' as any)}>
            <View style={styles.menuLeft}>
              <Ionicons name="heart-outline" size={20} color="#ef476f" />
              <Text style={styles.menuText}>Đang theo dõi (Shop)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/register-shop' as any)}>
            <View style={styles.menuLeft}>
              <Ionicons name="storefront-outline" size={20} color="#10b981" />
              <Text style={styles.menuText}>Đăng ký bán hàng</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>

          {(profile?.role === 'seller' || profile?.role === 'admin') && (
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/seller-dashboard' as any)}>
              <View style={styles.menuLeft}>
                <MaterialCommunityIcons name="storefront-outline" size={20} color="#ef476f" />
                <Text style={styles.menuText}>Kênh người bán</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}

          {profile?.role === 'admin' && (
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/dashboard' as any)}>
              <View style={styles.menuLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#4392F9" />
                <Text style={styles.menuText}>Quản lý hệ thống (Admin)</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
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
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  profileCard: {
    marginTop: 12,
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  memberBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1F3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F73658',
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
    fontSize: 16,
    fontWeight: '700',
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4747',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default BuyerAccountScreen;
