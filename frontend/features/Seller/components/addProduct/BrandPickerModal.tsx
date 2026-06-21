import { FlashList } from '@shopify/flash-list';
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sellerApi } from '../../../../lib/sellerApi';

interface BrandPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedBrand: string | null;
  onSelect: (brand: string) => void;
}

const BrandPickerModal: React.FC<BrandPickerModalProps> = ({
  visible,
  onClose,
  selectedBrand,
  onSelect,
}) => {
  const [brands, setBrands] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadBrands();
    }
  }, [visible]);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const list = await sellerApi.getBrands();
      setBrands(list);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter((b) =>
    b.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleManualEntry = () => {
    if (searchText.trim()) {
      onSelect(searchText.trim());
      onClose();
      setSearchText('');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chọn thương hiệu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#9aa0a6" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm hoặc nhập thương hiệu mới..."
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleManualEntry}
            />
          </View>

          <FlashList data={filteredBrands}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.brandItem,
                  selectedBrand === item && styles.selectedBrandItem,
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                  setSearchText('');
                }}
              >
                <Text
                  style={[
                    styles.brandName,
                    selectedBrand === item && styles.selectedBrandName,
                  ]}
                >
                  {item}
                </Text>
                {selectedBrand === item && (
                  <Ionicons name="checkmark" size={20} color="#3b82f6" />
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              searchText ? (
                <TouchableOpacity style={styles.manualEntry} onPress={handleManualEntry}>
                  <Text style={styles.manualEntryText}>
                    Sử dụng "{searchText}" làm thương hiệu mới
                  </Text>
                  <Ionicons name="add" size={20} color="#3b82f6" />
                </TouchableOpacity>
              ) : null
            }
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Dimensions.get('window').height * 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#2c3e50',
  },
  listContent: {
    paddingBottom: 20,
  },
  brandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  selectedBrandItem: {
    backgroundColor: '#f0f7ff',
  },
  brandName: {
    fontSize: 15,
    color: '#2c3e50',
  },
  selectedBrandName: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
  manualEntry: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  manualEntryText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});

export default BrandPickerModal;
