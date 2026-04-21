import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductDetailsSectionProps {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  categoryLabel?: string;
  onPressCategory?: () => void;
}

const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  categoryLabel = 'Chọn danh mục phù hợp',
  onPressCategory,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>TÊN SẢN PHẨM</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={onNameChange}
          placeholder="Nhập tên sản phẩm của bạn..."
          placeholderTextColor="#adb5bd"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>MÔ TẢ SẢN PHẨM</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="Chia sẻ đầy đủ về sản phẩm này, chất liệu, kích thước và công dụng..."
          placeholderTextColor="#adb5bd"
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.selectorRow} activeOpacity={0.8} onPress={onPressCategory}>
        <View>
          <Text style={styles.inputLabel}>DANH MỤC</Text>
          <Text style={styles.selectorText}>{categoryLabel}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9aa0a6" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.selectorRow} activeOpacity={0.8}>
        <View>
          <Text style={styles.inputLabel}>THƯƠNG HIỆU</Text>
          <Text style={styles.selectorText}>Thiết lập thương hiệu (Tùy chọn)</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9aa0a6" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    borderRadius: 2,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2b2d42',
  },
  inputGroup: {
    marginTop: 12,
    backgroundColor: '#fafbfc',
    borderWidth: 1,
    borderColor: '#edf0f3',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputLabel: {
    fontSize: 9,
    color: '#9aa0a6',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textInput: {
    marginTop: 6,
    fontSize: 14,
    color: '#2c3e50',
    paddingVertical: 0,
  },
  textArea: {
    minHeight: 80,
    lineHeight: 18,
  },
  selectorRow: {
    marginTop: 10,
    backgroundColor: '#fafbfc',
    borderWidth: 1,
    borderColor: '#edf0f3',
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    marginTop: 4,
    fontSize: 13,
    color: '#2c3e50',
  },
});

export default ProductDetailsSection;
