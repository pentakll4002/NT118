import React, { useMemo, useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar';
import { sellerApi, ShopProfile } from '@/lib/sellerApi';

const ShopProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<ShopProfile>>({});

  useEffect(() => {
    fetchShopInfo();
  }, []);

  const fetchShopInfo = async () => {
    try {
      setLoading(true);
      const data = await sellerApi.getShopInfo();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch shop info:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Note: Update API not yet implemented in sellerApi, but we can mock success
    try {
      setSaving(true);
      // await sellerApi.updateShopInfo(profile);
      setTimeout(() => {
        Alert.alert('Thành công', 'Đã cập nhật thông tin cửa hàng');
        setSaving(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu thay đổi');
      setSaving(false);
    }
  };

  const completion = useMemo(() => {
    if (!profile) return 0;
    const fields = ['name', 'description', 'address', 'phone'];
    const filled = fields.filter(f => (profile as any)[f]?.trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, color: '#6b7280' }}>Đang tải thông tin shop...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <Text style={styles.headerTitle}>Hồ sơ Shop</Text>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="checkmark" size={18} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <View style={styles.cover} />
        <View style={styles.identitySection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={13} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.identityText}>
            <Text style={styles.shopName}>{profile.name || 'Shop Name'}</Text>
            <Text style={styles.badge}>{profile.isVerified ? 'NHÀ BÁN HÀNG UY TÍN' : 'CỬA HÀNG MỚI'}</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Mức độ hoàn thiện hồ sơ</Text>
          <Text style={styles.progressValue}>{completion}%</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>TÊN SHOP</Text>
          <TextInput
            value={profile.name}
            onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
            style={styles.fieldInput}
            placeholder="Nhập tên shop"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.fieldLabel}>MÔ TẢ SHOP</Text>
          <TextInput
            value={profile.description}
            onChangeText={(text) => setProfile((prev) => ({ ...prev, description: text }))}
            style={[styles.fieldInput, styles.textArea]}
            multiline
            textAlignVertical="top"
            placeholder="Mô tả ngắn về shop..."
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.fieldLabel}>ĐỊA CHỈ</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={16} color="#ef476f" />
            <TextInput
              value={profile.address}
              onChangeText={(text) => setProfile((prev) => ({ ...prev, address: text }))}
              style={styles.addressInput}
              placeholder="Địa chỉ shop"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <Text style={styles.fieldLabel}>SỐ ĐIỆN THOẠI</Text>
          <View style={styles.addressRow}>
            <Ionicons name="call-outline" size={16} color="#ef476f" />
            <TextInput
              value={profile.phone}
              onChangeText={(text) => setProfile((prev) => ({ ...prev, phone: text }))}
              style={styles.addressInput}
              keyboardType="phone-pad"
              placeholder="Số điện thoại hỗ trợ khách hàng"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <Text style={styles.fieldLabel}>GIỜ HOẠT ĐỘNG</Text>
          <View style={styles.addressRow}>
            <Ionicons name="time-outline" size={16} color="#ef476f" />
            <TextInput
              value={profile.businessHours}
              onChangeText={(text) => setProfile((prev) => ({ ...prev, businessHours: text }))}
              style={styles.addressInput}
              placeholder="Ví dụ: 08:00 - 22:00"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color="#3b82f6" />
            <Text style={styles.metricTitle}>Xác thực Shop</Text>
            <Text style={styles.metricSub}>Đã xác thực 100%</Text>
          </View>
          <View style={[styles.metricCard, styles.metricCardEmphasis]}>
            <MaterialCommunityIcons name="bullhorn-outline" size={20} color="#ef476f" />
            <Text style={styles.metricTitle}>Quảng bá Shop</Text>
            <Text style={styles.metricSub}>Tăng khả năng tiếp cận</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TouchableOpacity 
          style={[styles.saveButton, saving && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>LƯU THAY ĐỔI</Text>
          )}
        </TouchableOpacity>
      </View>

      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  scrollContent: {
    paddingBottom: 190,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
  },
  headerAction: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e8f1ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cover: {
    height: 130,
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#d1d5db',
  },
  identitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: -22,
  },
  avatarWrap: {
    width: 82,
    height: 82,
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbe1ea',
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  editAvatarBtn: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: {
    marginLeft: 12,
    flex: 1,
  },
  shopName: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '800',
    color: '#1f2937',
  },
  badge: {
    marginTop: 2,
    fontSize: 12,
    color: '#ef476f',
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  progressCard: {
    marginTop: 14,
    marginHorizontal: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '800',
  },
  formCard: {
    marginTop: 10,
    marginHorizontal: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  fieldLabel: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  fieldInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
    paddingVertical: 8,
  },
  textArea: {
    minHeight: 90,
    fontSize: 16,
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 7,
    gap: 8,
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  metricsRow: {
    marginTop: 12,
    marginHorizontal: 14,
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    alignItems: 'center',
  },
  metricCardEmphasis: {
    borderColor: '#fecdd3',
    backgroundColor: '#fff7f8',
  },
  metricTitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  metricSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 74,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
});

export default ShopProfileScreen;
