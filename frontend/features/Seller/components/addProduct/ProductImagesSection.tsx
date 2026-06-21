import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductImagesSectionProps {
  images: string[];
  variantImages?: string[];
  onImagesChange: (images: string[]) => void;
}

const ProductImagesSection: React.FC<ProductImagesSectionProps> = ({ images, variantImages = [], onImagesChange }) => {
  const combinedImages = [...images, ...variantImages];
  const maxLimit = 8;
  const slotsCount = Math.max(maxLimit, combinedImages.length + (combinedImages.length < maxLimit ? 0 : 1));
  const slots = Array.from({ length: slotsCount }, (_, index) => index);

  const pickImage = async () => {
    if (combinedImages.length >= maxLimit) {
      Alert.alert('Thông báo', `Bạn chỉ có thể chọn tối đa ${maxLimit} hình ảnh.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: maxLimit - combinedImages.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      onImagesChange([...images, ...newUris]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Hình ảnh sản phẩm</Text>
        <Text style={styles.sectionCount}>{combinedImages.length} / {maxLimit}</Text>
      </View>
      <Text style={styles.hintText}>Ảnh bìa nên rõ nét, nền sáng và thấy đầy đủ sản phẩm.</Text>

      <View style={styles.imageGrid}>
        {slots.map((slotIndex) => {
          const hasMainImage = slotIndex < images.length;
          const hasVariantImage = slotIndex >= images.length && slotIndex < combinedImages.length;
          const hasImage = hasMainImage || hasVariantImage;
          const imageUri = hasImage ? combinedImages[slotIndex] : null;

          return (
            <TouchableOpacity
              key={slotIndex}
              style={[
                styles.imageSlot,
                slotIndex === 0 && !hasImage ? styles.primaryImageSlot : null,
              ]}
              activeOpacity={0.8}
              onPress={hasImage ? undefined : pickImage}
            >
              {hasImage ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: imageUri! }} style={styles.pickedImage} />
                  {hasMainImage && (
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeImage(slotIndex)}
                    >
                      <Ionicons name="close-circle" size={18} color="#f87171" />
                    </TouchableOpacity>
                  )}
                  {hasVariantImage && (
                    <View style={styles.variantBadge}>
                      <Text style={styles.variantBadgeText}>Phân loại</Text>
                    </View>
                  )}
                </View>
              ) : (
                <>
                  <Ionicons
                    name={slotIndex === 0 ? 'camera-outline' : 'image-outline'}
                    size={slotIndex === 0 ? 22 : 18}
                    color={slotIndex === 0 ? '#3498db' : '#c0c4cc'}
                  />
                  {slotIndex === 0 ? <Text style={styles.primaryImageText}>THÊM KHUNG ẢNH</Text> : null}
                </>
              )}
            </TouchableOpacity>
          );
        })}
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
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  pickedImage: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  variantBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  variantBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
  },
});

export default ProductImagesSection;
