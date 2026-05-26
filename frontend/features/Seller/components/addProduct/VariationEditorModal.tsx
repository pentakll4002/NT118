import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreateProductVariantPayload } from '../../../../lib/sellerApi';

interface VariationEditorModalProps {
  visible: boolean;
  onClose: () => void;
  variants: CreateProductVariantPayload[];
  onSave: (variants: CreateProductVariantPayload[]) => void;
}

const VariationEditorModal: React.FC<VariationEditorModalProps> = ({
  visible,
  onClose,
  variants,
  onSave,
}) => {
  const [localVariants, setLocalVariants] = useState<CreateProductVariantPayload[]>(
    variants.length > 0 ? [...variants] : []
  );

  const addVariant = () => {
    setLocalVariants([
      ...localVariants,
      { name: '', value: '', priceModifier: 0, stockQuantity: 0 },
    ]);
  };

  const removeVariant = (index: number) => {
    const newList = [...localVariants];
    newList.splice(index, 1);
    setLocalVariants(newList);
  };

  const updateVariant = (index: number, field: keyof CreateProductVariantPayload, val: string) => {
    const newList = [...localVariants];
    const item = { ...newList[index] };

    if (field === 'priceModifier' || field === 'stockQuantity') {
      const num = parseInt(val.replace(/\D/g, '') || '0', 10);
      (item as any)[field] = num;
    } else {
      (item as any)[field] = val;
    }

    newList[index] = item;
    setLocalVariants(newList);
  };

  const handleSave = () => {
    // Validate
    const isValid = localVariants.every((v) => v.name.trim() && v.value.trim());
    if (localVariants.length > 0 && !isValid) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ Tên và Giá trị cho tất cả phân loại.');
      return;
    }
    onSave(localVariants);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Phân loại hàng</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.hintText}>
              Thêm các lựa chọn như Màu sắc (Đỏ, Xanh) hoặc Kích thước (S, M, L).
            </Text>

            {localVariants.map((v, index) => (
              <View key={index} style={styles.variantCard}>
                <View style={styles.variantHeader}>
                  <Text style={styles.variantNumber}>Phân loại {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeVariant(index)}>
                    <Ionicons name="trash-outline" size={18} color="#f87171" />
                  </TouchableOpacity>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>TÊN (VÍ DỤ: MÀU SẮC)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={v.name}
                      onChangeText={(t) => updateVariant(index, 'name', t)}
                      placeholder="Màu sắc..."
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>GIÁ TRỊ (VÍ DỤ: ĐỎ)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={v.value}
                      onChangeText={(t) => updateVariant(index, 'value', t)}
                      placeholder="Đỏ..."
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>CHÊNH LỆCH GIÁ (đ)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={v.priceModifier.toLocaleString('vi-VN')}
                      onChangeText={(t) => updateVariant(index, 'priceModifier', t)}
                      keyboardType="number-pad"
                      placeholder="0"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>KHO HÀNG</Text>
                    <TextInput
                      style={styles.textInput}
                      value={v.stockQuantity.toString()}
                      onChangeText={(t) => updateVariant(index, 'stockQuantity', t)}
                      keyboardType="number-pad"
                      placeholder="0"
                    />
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addVariant}>
              <Ionicons name="add" size={20} color="#3b82f6" />
              <Text style={styles.addButtonText}>Thêm phân loại mới</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  hintText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  variantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  variantNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {},
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1e293b',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    marginBottom: 40,
  },
  addButtonText: {
    marginLeft: 4,
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default VariationEditorModal;
