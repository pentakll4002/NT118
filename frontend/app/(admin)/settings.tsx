import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Switch,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { clearAuthToken } from '@/lib/authToken';
import { userApi, UserProfileDTO } from '@/lib/userApi';

export default function AdminSettings() {
  const router = useRouter();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // Profile form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userApi.getProfile();
      setProfile(data);
      setName(data.name);
      setPhone(data.phone || '');
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearAuthToken();
    router.replace('/login');
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên hiển thị');
      return;
    }
    try {
      setSavingProfile(true);
      await userApi.updateProfile({ name, phone });
      setProfile(prev => prev ? { ...prev, name, phone } : null);
      setProfileModalVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      setSavingPassword(true);
      await userApi.changePassword({ oldPassword, newPassword });
      setPasswordModalVisible(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Thành công', 'Đã đổi mật khẩu thành công');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Mật khẩu cũ không đúng');
    } finally {
      setSavingPassword(false);
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, color = '#2c3e50', rightElement }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '10' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement ? rightElement : <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thiết lập</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{profile?.name?.charAt(0) || 'A'}</Text>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{profile?.name || 'Admin'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || 'admin@test.com'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TÀI KHOẢN & BẢO MẬT</Text>
          <View style={styles.card}>
            <SettingItem
              icon="person-outline"
              title="Thông tin cá nhân"
              subtitle="Cập nhật tên, số điện thoại..."
              color="#4392F9"
              onPress={() => setProfileModalVisible(true)}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="lock-closed-outline"
              title="Đổi mật khẩu"
              subtitle="Tăng cường bảo mật tài khoản"
              color="#6366f1"
              onPress={() => setPasswordModalVisible(true)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CẤU HÌNH HỆ THỐNG (MẪU)</Text>
          <View style={styles.card}>
            <SettingItem
              icon="stats-chart-outline"
              title="Phần trăm hoa hồng"
              subtitle="Hiện tại: 2% trên mỗi đơn hàng"
              color="#f59e0b"
            />
            <View style={styles.divider} />
            <SettingItem
              icon="construct-outline"
              title="Chế độ bảo trì"
              subtitle="Tạm đóng ứng dụng để nâng cấp"
              color="#ef4444"
              rightElement={
                <Switch
                  value={maintenanceMode}
                  onValueChange={setMaintenanceMode}
                  trackColor={{ false: '#d1d5db', true: '#fca5a5' }}
                  thumbColor={maintenanceMode ? '#ef4444' : '#f3f4f6'}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HỖ TRỢ & THÔNG TIN</Text>
          <View style={styles.card}>
            <SettingItem
              icon="help-circle-outline"
              title="Trung tâm hỗ trợ Admin"
              color="#64748b"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="information-circle-outline"
              title="Phiên bản ứng dụng"
              subtitle="v1.0.2 (Build 2026.04)"
              color="#94a3b8"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>

        <View style={styles.footerSpacing} />
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal visible={profileModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sửa hồ sơ Admin</Text>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên hiển thị</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={savingProfile}>
              {savingProfile ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Lưu thay đổi</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal visible={passwordModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mật khẩu cũ</Text>
              <TextInput style={styles.input} value={oldPassword} onChangeText={setOldPassword} secureTextEntry />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword} disabled={savingPassword}>
              {savingPassword ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Cập nhật mật khẩu</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  scrollContent: {
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4392F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1e293b',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 66,
  },
  logoutBtn: {
    marginTop: 32,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerSpacing: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#4392F9',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
