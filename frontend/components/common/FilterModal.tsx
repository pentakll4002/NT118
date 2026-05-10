import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply }) => {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedService, setSelectedService] = useState<string[]>([]);
  
  const services = [
    { id: 'mall', label: 'Shopee Mall' },
    { id: 'freeship', label: 'Miễn phí vận chuyển' },
    { id: 'discount', label: 'Đang giảm giá' },
    { id: 'installment', label: 'Trả góp 0%' },
  ];

  const toggleService = (id: string) => {
    setSelectedService(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedService([]);
  };

  const handleApply = () => {
    onApply({
      minPrice,
      maxPrice,
      services: selectedService
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.modalContent}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Bộ lọc tìm kiếm</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
              {/* Khoảng Giá Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Khoảng Giá (₫)</Text>
                <View style={styles.priceInputRow}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="TỐI THIỂU"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                  <View style={styles.priceDivider} />
                  <TextInput
                    style={styles.priceInput}
                    placeholder="TỐI ĐA"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>
              </View>

              {/* Dịch vụ & Khuyến mãi Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dịch vụ & Khuyến mãi</Text>
                <View style={styles.optionsGrid}>
                  {services.map((item) => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={[
                        styles.optionTag, 
                        selectedService.includes(item.id) && styles.activeOptionTag
                      ]}
                      onPress={() => toggleService(item.id)}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedService.includes(item.id) && styles.activeOptionText
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Vị trí Section - Giả lập */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Địa điểm</Text>
                <View style={styles.optionsGrid}>
                  {['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Thái Nguyên'].map((loc) => (
                    <TouchableOpacity key={loc} style={styles.optionTag}>
                      <Text style={styles.optionText}>{loc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>THIẾT LẬP LẠI</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>ÁP DỤNG</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: 'white',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  scrollBody: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    height: 40,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 12,
    textAlign: 'center',
  },
  priceDivider: {
    width: 10,
    height: 1,
    backgroundColor: '#DDD',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    minWidth: (width * 0.85 - 40) / 2,
    alignItems: 'center',
  },
  activeOptionTag: {
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: '#F73658',
  },
  optionText: {
    fontSize: 12,
    color: '#333',
  },
  activeOptionText: {
    color: '#F73658',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 12,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  applyButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#F73658',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default FilterModal;
