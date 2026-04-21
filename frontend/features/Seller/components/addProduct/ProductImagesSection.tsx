import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductImagesSection: React.FC = () => {
  const slots = Array.from({ length: 6 }, (_, index) => index);

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Hình ảnh sản phẩm</Text>
        <Text style={styles.sectionCount}>0 / 6</Text>
      </View>
      <Text style={styles.hintText}>Ảnh bìa nên rõ nét, nền sáng và thấy đầy đủ sản phẩm.</Text>

      <View style={styles.imageGrid}>
        {slots.map((slotIndex) => (
          <TouchableOpacity
            key={slotIndex}
            style={[styles.imageSlot, slotIndex === 0 ? styles.primaryImageSlot : null]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={slotIndex === 0 ? 'camera-outline' : 'image-outline'}
              size={slotIndex === 0 ? 22 : 18}
              color={slotIndex === 0 ? '#3498db' : '#c0c4cc'}
            />
            {slotIndex === 0 ? <Text style={styles.primaryImageText}>THÊM KHUNG ẢNH</Text> : null}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    borderRadius: 2,
    padding: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2b2d42',
  },
  sectionCount: {
    fontSize: 11,
    color: '#9aa0a6',
  },
  hintText: {
    fontSize: 11,
    color: '#8b93a1',
    marginBottom: 10,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  imageSlot: {
    width: '33.3333%',
    height: 96,
    paddingHorizontal: 4,
    marginBottom: 6,
    backgroundColor: '#f4f6fb',
    borderWidth: 1,
    borderColor: '#edf0f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryImageSlot: {
    borderStyle: 'dashed',
    borderColor: '#7aa6ff',
    backgroundColor: '#eef4ff',
  },
  primaryImageText: {
    marginTop: 6,
    fontSize: 9,
    color: '#3b82f6',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default ProductImagesSection;
