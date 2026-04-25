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
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, AdminCategoryDTO, CreateCategoryRequest } from '@/lib/adminApi';

const CategoryManagementScreen: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryDTO | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState('0');

  const fetchCategories = useCallback(async () => {
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh mục');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = (category?: AdminCategoryDTO) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setSlug(category.slug);
      setSortOrder(category.sortOrder.toString());
    } else {
      setEditingCategory(null);
      setName('');
      setSlug('');
      setSortOrder('0');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên và slug');
      return;
    }

    try {
      const payload: CreateCategoryRequest = {
        name,
        slug,
        sortOrder: parseInt(sortOrder) || 0,
        status: 'active',
      };

      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, payload);
        Alert.alert('Thành công', 'Cập nhật danh mục thành công');
      } else {
        await adminApi.createCategory(payload);
        Alert.alert('Thành công', 'Tạo danh mục thành công');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu danh mục');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa danh mục này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteCategory(id);
              fetchCategories();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa danh mục');
            }
          },
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Quản lý danh mục</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.listCard}>
          {categories.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSlug}>/{item.slug}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenModal(item)}>
                  <Ionicons name="pencil-outline" size={20} color="#3498db" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {categories.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Chưa có danh mục nào</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên danh mục</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ví dụ: Điện tử"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Slug (URL)</Text>
              <TextInput
                style={styles.input}
                value={slug}
                onChangeText={setSlug}
                placeholder="Ví dụ: dien-tu"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Thứ tự hiển thị</Text>
              <TextInput
                style={styles.input}
                value={sortOrder}
                onChangeText={setSortOrder}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Lưu danh mục</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
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
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  itemSlug: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionBtn: {
    padding: 5,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7f8c8d',
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
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#edf2f7',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: '#2c3e50',
  },
  saveButton: {
    backgroundColor: '#3498db',
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CategoryManagementScreen;
