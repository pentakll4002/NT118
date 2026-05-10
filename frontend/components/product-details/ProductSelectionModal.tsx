import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductDTO, formatPriceFull } from '../../lib/productApi';

interface ProductSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  product: ProductDTO;
  selectedQuantity: number;
  setSelectedQuantity: (qty: number) => void;
  mode: 'cart' | 'buy';
  onConfirm: () => void;
  loading: boolean;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  visible, onClose, product, selectedQuantity, setSelectedQuantity, mode, onConfirm, loading
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
          <TouchableOpacity 
            style={styles.closeModalBtnTop} 
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.modalHeader}>
            <Image 
              source={product.image ? { uri: product.image } : require('../../assets/images/Group 34010.png')} 
              style={styles.modalProductImage} 
            />
            <View style={styles.modalHeaderInfo}>
              <Text style={styles.modalPrice}>{formatPriceFull(product.price)}</Text>
              <Text style={styles.modalStock}>Kho: {product.stockQuantity}</Text>
            </View>
          </View>

          <ScrollView style={styles.selectionScroll}>
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
                  onPress={() => setSelectedQuantity(Math.min(product.stockQuantity, selectedQuantity + 1))}
                >
                  <Ionicons name="add" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={styles.confirmBtn}
            onPress={onConfirm}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <Text style={styles.confirmBtnText}>
                {mode === 'cart' ? 'THÊM VÀO GIỎ HÀNG' : 'MUA NGAY'}
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
    width: 100,
    height: 100,
    borderRadius: 12,
    marginTop: -40,
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
  closeModalBtnTop: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  selectionScroll: {
    maxHeight: 300,
    paddingHorizontal: 20,
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
  confirmBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ProductSelectionModal;
