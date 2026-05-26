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
  const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
  const [showAllLocations, setShowAllLocations] = useState(false);
  
  const services = [
    { id: 'mall', label: 'Shopee Mall', icon: 'shield-checkmark' },
    { id: 'freeship', label: 'Miễn phí vận chuyển', icon: 'airplane' },
    { id: 'discount', label: 'Đang giảm giá', icon: 'pricetag' },
    { id: 'installment', label: 'Trả góp 0%', icon: 'card' },
  ];

  const allLocations = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Bình Dương', 'Đồng Nai', 
    'Hải Phòng', 'Cần Thơ', 'Bắc Ninh', 'Long An', 'Hưng Yên', 
    'Thái Nguyên', 'Quảng Ninh', 'Khánh Hòa', 'Lâm Đồng', 'Nghệ An', 
    'Thanh Hóa', 'Vĩnh Phúc', 'Hà Nam', 'Bắc Giang', 'Tiền Giang'
  ];

  const visibleLocations = showAllLocations ? allLocations : allLocations.slice(0, 8);

  const toggleService = (id: string) => {
    setSelectedService(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocation(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedService([]);
    setSelectedLocation([]);
  };

  const handleApply = () => {
    onApply({
      minPrice,
      maxPrice,
      services: selectedService,
      locations: selectedLocation
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          onPress={onClose} 
          activeOpacity={1} 
        />
        
        <View style={styles.modalContent}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <View style={styles.header}>
              <View style={styles.headerIndicator} />
              <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>Bộ lọc tìm kiếm</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color="#1a1a1a" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView 
              style={styles.scrollBody} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Khoảng Giá Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="cash-outline" size={18} color="#F73658" />
                  <Text style={styles.sectionTitle}>Khoảng Giá (₫)</Text>
                </View>
                <View style={styles.priceInputRow}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.currencyPrefix}>₫</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="TỐI THIỂU"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={minPrice}
                      onChangeText={setMinPrice}
                    />
                  </View>
                  <View style={styles.priceDivider} />
                  <View style={styles.inputWrapper}>
                    <Text style={styles.currencyPrefix}>₫</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="TỐI ĐA"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                    />
                  </View>
                </View>
              </View>

              {/* Dịch vụ & Khuyến mãi Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="sparkles-outline" size={18} color="#F73658" />
                  <Text style={styles.sectionTitle}>Dịch vụ & Khuyến mãi</Text>
                </View>
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
                      <Ionicons 
                        name={item.icon as any} 
                        size={14} 
                        color={selectedService.includes(item.id) ? "#F73658" : "#666"} 
                        style={{ marginRight: 6 }}
                      />
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

              {/* Địa điểm Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="location-outline" size={18} color="#F73658" />
                  <Text style={styles.sectionTitle}>Địa điểm</Text>
                </View>
                <View style={styles.optionsGrid}>
                  {visibleLocations.map((loc) => (
                    <TouchableOpacity 
                      key={loc} 
                      style={[
                        styles.optionTag,
                        selectedLocation.includes(loc) && styles.activeOptionTag
                      ]}
                      onPress={() => toggleLocation(loc)}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedLocation.includes(loc) && styles.activeOptionText
                      ]}>
                        {loc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity 
                  style={styles.seeMoreBtn} 
                  onPress={() => setShowAllLocations(!showAllLocations)}
                >
                  <Text style={styles.seeMoreText}>
                    {showAllLocations ? 'Thu gọn' : `Xem thêm (${allLocations.length - 8} địa điểm)`}
                  </Text>
                  <Ionicons 
                    name={showAllLocations ? "chevron-up" : "chevron-down"} 
                    size={14} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={handleReset}
                activeOpacity={0.7}
              >
                <Text style={styles.resetButtonText}>THIẾT LẬP LẠI</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton} 
                onPress={handleApply}
                activeOpacity={0.9}
              >
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    width: width * 0.82,
    backgroundColor: 'white',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  headerIndicator: {
    width: 30,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
    display: 'none', // Optional, can show on bottom sheets
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#eee',
  },
  currencyPrefix: {
    fontSize: 14,
    color: '#999',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  priceDivider: {
    width: 12,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionTag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '47%',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeOptionTag: {
    backgroundColor: '#fff5f6',
    borderColor: '#F73658',
  },
  optionText: {
    fontSize: 12,
    color: '#4a4a4a',
    fontWeight: '500',
  },
  activeOptionText: {
    color: '#F73658',
    fontWeight: '700',
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    gap: 4,
  },
  seeMoreText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    backgroundColor: 'white',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4a4a4a',
  },
  applyButton: {
    flex: 2,
    height: 52,
    backgroundColor: '#F73658',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    shadowColor: '#F73658',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
});

export default FilterModal;
