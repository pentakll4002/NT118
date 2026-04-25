import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, AdminUserDTO } from '@/lib/adminApi';
import { useRouter } from 'expo-router';

const UserManagementScreen: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
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

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4392F9" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Người dùng</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên hoặc email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.listCard}>
          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.listItem}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{user.username}</Text>
                <Text style={styles.itemSub}>{user.email}</Text>
                <Text style={styles.itemDate}>Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: user.role === 'admin' ? '#e74c3c' : '#3498db' }]}>
                <Text style={styles.badgeText}>{user.role}</Text>
              </View>
            </View>
          ))}
          {filteredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 45,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4392F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
  },
  itemSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  itemDate: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7f8c8d',
  },
});

export default UserManagementScreen;
