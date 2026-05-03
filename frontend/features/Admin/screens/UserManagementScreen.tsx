import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, AdminUserDTO } from '@/lib/adminApi';
import { useRouter } from 'expo-router';

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string; desc: string }> = {
  admin: { label: 'Admin', color: '#dc2626', bg: '#fef2f2', icon: 'shield-checkmark', desc: 'Toàn quyền quản trị hệ thống' },
  seller: { label: 'Người bán', color: '#ea580c', bg: '#fff7ed', icon: 'storefront', desc: 'Có thể mở shop và bán hàng' },
  buyer: { label: 'Người mua', color: '#2563eb', bg: '#eff6ff', icon: 'person', desc: 'Tài khoản cá nhân mua hàng' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Hoạt động', color: '#16a34a', bg: '#f0fdf4' },
  inactive: { label: 'Ngưng HĐ', color: '#d97706', bg: '#fffbeb' },
  banned: { label: 'Bị khóa', color: '#dc2626', bg: '#fef2f2' },
};

const UserManagementScreen: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'buyer' | 'seller' | 'admin'>('all');

  const [editingUser, setEditingUser] = useState<AdminUserDTO | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || user.role === filter;
      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, filter]);

  const roleCounts = useMemo(() => {
    const counts = { all: users.length, buyer: 0, seller: 0, admin: 0 };
    users.forEach(u => {
      if (u.role in counts) counts[u.role as keyof typeof counts]++;
    });
    return counts;
  }, [users]);

  const handleEditRole = (user: AdminUserDTO) => {
    setEditingUser(user);
    setNewRole(user.role);
    setModalVisible(true);
  };

  const handleUpdateRole = async () => {
    if (!editingUser || newRole === editingUser.role) {
      setModalVisible(false);
      return;
    }
    setUpdating(true);
    try {
      await adminApi.updateUserRole(editingUser.id, newRole);
      Alert.alert('Thành công', `Đã cập nhật quyền cho ${editingUser.username} thành ${ROLE_CONFIG[newRole]?.label || newRole}`);
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật quyền người dùng');
    } finally {
      setUpdating(false);
    }
  };

  const handlePromoteToSeller = (user: AdminUserDTO) => {
    Alert.alert(
      'Nâng cấp thành Shop',
      `Bạn muốn nâng cấp "${user.username}" thành Người bán?\n\nHệ thống sẽ tự động tạo một cửa hàng cho họ.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Nâng cấp',
          onPress: async () => {
            try {
              await adminApi.updateUserRole(user.id, 'seller');
              Alert.alert('🎉 Thành công', `Đã nâng cấp "${user.username}" thành Người bán. Cửa hàng đã được tạo tự động!`);
              fetchUsers();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể nâng cấp người dùng');
            }
          }
        }
      ]
    );
  };

  const handleToggleStatus = (user: AdminUserDTO) => {
    const newStatus = user.status === 'active' ? 'banned' : 'active';
    const label = newStatus === 'active' ? 'mở khóa' : 'khóa';
    Alert.alert(
      `Xác nhận ${label}`,
      `Bạn có chắc muốn ${label} tài khoản "${user.username}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: label.charAt(0).toUpperCase() + label.slice(1),
          style: newStatus === 'banned' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await adminApi.updateUserStatus(user.id, newStatus);
              Alert.alert('Thành công', `Đã ${label} tài khoản "${user.username}".`);
              fetchUsers();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || `Không thể ${label} tài khoản`);
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = (user: AdminUserDTO) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${user.username}"?\n\nHành động này không thể hoàn tác!`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteUser(user.id);
              Alert.alert('Đã xóa', `Tài khoản "${user.username}" đã bị xóa.`);
              fetchUsers();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa người dùng');
            }
          }
        }
      ]
    );
  };

  const getRoleInfo = (role: string) => ROLE_CONFIG[role] || ROLE_CONFIG.buyer;
  const getStatusInfo = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.active;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4392F9" />
          <Text style={{ marginTop: 12, color: '#64748b' }}>Đang tải danh sách...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Quản lý người dùng</Text>
          <Text style={styles.headerSubtitle}>{users.length} thành viên</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Filter tabs */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { id: 'all' as const, label: `Tất cả (${roleCounts.all})` },
            { id: 'buyer' as const, label: `Người mua (${roleCounts.buyer})` },
            { id: 'seller' as const, label: `Người bán (${roleCounts.seller})` },
            { id: 'admin' as const, label: `Admin (${roleCounts.admin})` },
          ].map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.filterTab, filter === item.id && styles.filterTabActive]}
              onPress={() => setFilter(item.id)}
            >
              <Text style={[styles.filterTabText, filter === item.id && styles.filterTabTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.searchBar}>
        <View style={styles.searchInner}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên hoặc email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredUsers.map((user) => {
          const roleInfo = getRoleInfo(user.role);
          const statusInfo = getStatusInfo(user.status);
          return (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: roleInfo.bg }]}>
                  <Ionicons name={roleInfo.icon as any} size={22} color={roleInfo.color} />
                </View>

                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.username} numberOfLines={1}>{user.username}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: roleInfo.color }]}>
                      <Text style={styles.roleText}>{roleInfo.label}</Text>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                  </View>
                  <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.date}>
                      <Ionicons name="calendar-outline" size={11} color="#94a3b8" />{' '}
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                    {user.hasShop && (
                      <View style={styles.shopTag}>
                        <Ionicons name="storefront" size={10} color="#f59e0b" />
                        <Text style={styles.shopTagText}>Có shop</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.cardActions}>
                {user.role === 'buyer' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.promoteBtn]}
                    onPress={() => handlePromoteToSeller(user)}
                  >
                    <Ionicons name="arrow-up-circle-outline" size={16} color="#ea580c" />
                    <Text style={[styles.actionBtnText, { color: '#ea580c' }]}>Nâng thành Shop</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.roleBtn]}
                  onPress={() => handleEditRole(user)}
                >
                  <Ionicons name="shield-outline" size={16} color="#6366f1" />
                  <Text style={[styles.actionBtnText, { color: '#6366f1' }]}>Phân quyền</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, user.status === 'active' ? styles.banBtn : styles.unbanBtn]}
                  onPress={() => handleToggleStatus(user)}
                >
                  <Ionicons
                    name={user.status === 'active' ? 'lock-closed-outline' : 'lock-open-outline'}
                    size={16}
                    color={user.status === 'active' ? '#dc2626' : '#16a34a'}
                  />
                  <Text style={[styles.actionBtnText, { color: user.status === 'active' ? '#dc2626' : '#16a34a' }]}>
                    {user.status === 'active' ? 'Khóa' : 'Mở khóa'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#e2e8f0" />
            <Text style={styles.emptyText}>Không tìm thấy thành viên nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Edit Role Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={32} color="#4392F9" />
              <Text style={styles.modalTitle}>Phân quyền người dùng</Text>
            </View>
            <Text style={styles.modalUser}>Tài khoản: <Text style={{ fontWeight: '700' }}>{editingUser?.username}</Text></Text>
            <Text style={styles.modalEmail}>{editingUser?.email}</Text>

            <View style={styles.roleOptions}>
              {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleOption, newRole === role && styles.roleOptionActive]}
                  onPress={() => setNewRole(role)}
                >
                  <View style={[styles.roleIconWrap, { backgroundColor: config.bg }]}>
                    <Ionicons name={config.icon as any} size={20} color={config.color} />
                  </View>
                  <View style={styles.roleOptionInfo}>
                    <Text style={[styles.roleOptionText, newRole === role && styles.roleOptionTextActive]}>
                      {config.label}
                    </Text>
                    <Text style={styles.roleDesc}>{config.desc}</Text>
                  </View>
                  <View style={[styles.radio, newRole === role && styles.radioActive]}>
                    {newRole === role && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, updating && { opacity: 0.6 }]}
                onPress={handleUpdateRole}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmBtnText}>Cập nhật</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTabActive: {
    backgroundColor: '#4392F9',
    borderColor: '#4392F9',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  searchBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1e293b',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flexShrink: 1,
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  roleText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  email: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  date: {
    fontSize: 11,
    color: '#94a3b8',
  },
  shopTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shopTagText: {
    fontSize: 10,
    color: '#d97706',
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  promoteBtn: {
    borderColor: '#fed7aa',
    backgroundColor: '#fff7ed',
  },
  roleBtn: {
    borderColor: '#e0e7ff',
    backgroundColor: '#eef2ff',
  },
  banBtn: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  unbanBtn: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 8,
  },
  modalUser: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 2,
    textAlign: 'center',
  },
  modalEmail: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 20,
    textAlign: 'center',
  },
  roleOptions: {
    gap: 10,
    marginBottom: 24,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  roleOptionActive: {
    backgroundColor: '#f0f9ff',
    borderColor: '#93c5fd',
  },
  roleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleOptionInfo: {
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: '#3b82f6',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  roleOptionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  roleOptionTextActive: {
    color: '#1e40af',
  },
  roleDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  confirmBtn: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default UserManagementScreen;
