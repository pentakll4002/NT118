import { Image } from 'expo-image';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductDTO, formatPriceFull, ProductVariantDTO } from '../../lib/productApi';

interface ProductSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  product: ProductDTO;
  selectedQuantity: number;
  setSelectedQuantity: (qty: number) => void;
  selectedVariantId?: number;
  onSelectVariant: (variantId: number | undefined) => void;
  mode: 'cart' | 'buy';
  onConfirm: () => void;
  loading: boolean;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  visible,
  onClose,
  product,
  selectedQuantity,
  setSelectedQuantity,
  selectedVariantId,
  onSelectVariant,
  mode,
  onConfirm,
  loading,
}) => {
  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const currentPrice = product.price + (selectedVariant?.priceModifier || 0);
  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;

  // Group variants by name
  const groupedVariants = React.useMemo(() => {
    const groups: Record<string, { label: string; items: ProductVariantDTO[] }> = {};
    product.variants?.forEach((v) => {
      const key = v.name.trim().toLowerCase().normalize('NFC');
      let group = groups[key];
      if (!group) {
        group = { label: v.name.trim(), items: [] };
        groups[key] = group;
      }
      group.items.push(v);
    });
    return groups;
  }, [product.variants]);

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <TouchableOpacity style={styles.closeModalBtnTop} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.modalHeader}>
            <Image
              source={
                selectedVariant?.imageUrl
                  ? { uri: selectedVariant.imageUrl }
                  : product.image
                  ? { uri: product.image }
                  : product.thumbnails && product.thumbnails.length > 0
                  ? { uri: product.thumbnails[0] }
                  : require('../../assets/images/product/product-1.png')
              }
              style={styles.modalProductImage}
            />
            <View style={styles.modalHeaderInfo}>
              <Text style={styles.modalPrice}>{formatPriceFull(currentPrice)}</Text>
              <Text style={styles.modalStock}>Kho: {currentStock}</Text>
              {selectedVariant && (
                <Text style={styles.selectedVariantText}>
                  Đã chọn: {selectedVariant.name} {selectedVariant.value}
                </Text>
              )}
            </View>
          </View>

          <ScrollView style={styles.selectionScroll}>
            {Object.entries(groupedVariants).map(([key, group]) => (
              <View key={key} style={styles.variantGroup}>
                <Text style={styles.variantLabel}>{group.label}</Text>
                <View style={styles.variantOptions}>
                  {group.items?.map((v) => (
                    <TouchableOpacity
                      key={v.id}
                      style={[
                        styles.variantOption,
                        selectedVariantId === v.id && styles.variantOptionSelected,
                        v.stockQuantity === 0 && styles.variantOptionDisabled,
                      ]}
                      onPress={() => onSelectVariant(selectedVariantId === v.id ? undefined : v.id)}
                      disabled={v.stockQuantity === 0}
                    >
                      <Text
                        style={[
                          styles.variantOptionText,
                          selectedVariantId === v.id && styles.variantOptionTextSelected,
                          v.stockQuantity === 0 && styles.variantOptionTextDisabled,
                        ]}
                      >
                        {v.value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            <View style={styles.quantitySection}>
              <Text style={styles.variantLabel}>Số lượng</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                >
                  <Ionicons name="remove" size={20} color="#333" />
                </TouchableOpacity>
                <View style={styles.qtyInput}>
                  <Text style={styles.qtyText}>{selectedQuantity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setSelectedQuantity(Math.min(currentStock, selectedQuantity + 1))}
                >
                  <Ionicons name="add" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.confirmBtn, currentStock === 0 && styles.confirmBtnDisabled]}
            onPress={onConfirm}
            disabled={loading || currentStock === 0}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.confirmBtnText}>
                {currentStock === 0 ? 'HẾT HÀNG' : mode === 'cart' ? 'THÊM VÀO GIỎ HÀNG' : 'MUA NGAY'}
              </Text>
            )}
          </TouchableOpacity>
        </Pressable>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    padding: 20,
  },
  modalProductImage: {
    width: 130,
    height: 130,
    borderRadius: 12,
    marginTop: -50,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  modalHeaderInfo: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F83758',
  },
  modalStock: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  selectedVariantText: {
    fontSize: 13,
    color: '#F83758',
    fontWeight: '600',
    marginTop: 2,
  },
  closeModalBtnTop: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  selectionScroll: {
    maxHeight: 500,
    paddingHorizontal: 20,
  },
  variantGroup: {
    marginBottom: 20,
  },
  variantOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
  },
  variantOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  variantOptionSelected: {
    backgroundColor: '#FFF0F3',
    borderColor: '#F83758',
  },
  variantOptionDisabled: {
    backgroundColor: '#F1F3F5',
    borderColor: '#E9ECEF',
    opacity: 0.5,
  },
  variantOptionText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  variantOptionTextSelected: {
    color: '#F83758',
    fontWeight: '700',
  },
  variantOptionTextDisabled: {
    color: '#ADB5BD',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  variantLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  qtyBtn: {
    padding: 10,
  },
  qtyInput: {
    paddingHorizontal: 15,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  confirmBtn: {
    backgroundColor: '#F83758',
    margin: 20,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#ADB5BD',
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ProductSelectionModal;
