import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../lib/apiClient';

interface AddressItem {
  code: string;
  name: string;
  fullName: string;
}

interface AddressPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectComplete: (province: string, district: string, ward: string) => void;
}

export default function AddressPickerModal({ visible, onClose, onSelectComplete }: AddressPickerModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AddressItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [selectedProvince, setSelectedProvince] = useState<AddressItem | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<AddressItem | null>(null);

  const requestSeq = useRef(0);
  const startRequest = () => {
    requestSeq.current += 1;
    return requestSeq.current;
  };

  const isEmpty = !loading && !errorMessage && items.length === 0;

  const stepTitle = useMemo(() => {
    if (step === 1) return 'Chọn Tỉnh/Thành Phố';
    if (step === 2) return 'Chọn Quận/Huyện';
    return 'Chọn Phường/Xã';
  }, [step]);

  const fetchProvinces = async () => {
    const reqId = startRequest();
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await apiClient.get('/api/addresses/provinces');
      const data = res.data?.data || res.data;
      if (reqId !== requestSeq.current) return;
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Error fetching provinces', error);
      if (reqId !== requestSeq.current) return;
      setItems([]);
      setErrorMessage('Không tải được danh sách tỉnh/thành. Vui lòng thử lại.');
    } finally {
      if (reqId === requestSeq.current) setLoading(false);
    }
  };

  const fetchChildren = async (parentCode: string) => {
    const reqId = startRequest();
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await apiClient.get(`/api/addresses/children/${parentCode}`);
      const data = res.data?.data || res.data;
      if (reqId !== requestSeq.current) return;
      const nextItems = Array.isArray(data) ? data : [];
      setItems(nextItems);

      // Some datasets only have 2 levels (province -> wards) with no district/ward split.
      // If user is at step 3 and there are no children, auto-complete using the selectedDistrict as ward.
      if (step === 3 && nextItems.length === 0 && selectedProvince && selectedDistrict) {
        onSelectComplete(selectedProvince.fullName, selectedDistrict.fullName, selectedDistrict.fullName);
        resetState();
        onClose();
      }
    } catch (error) {
      console.log('Error fetching children', error);
      if (reqId !== requestSeq.current) return;
      setItems([]);
      setErrorMessage('Không tải được dữ liệu. Vui lòng thử lại.');
    } finally {
      if (reqId === requestSeq.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;

    setItems([]);
    setErrorMessage(null);

    if (step === 1) {
      fetchProvinces();
      return;
    }

    if (step === 2) {
      if (selectedProvince) fetchChildren(selectedProvince.code);
      return;
    }

    if (step === 3) {
      if (selectedDistrict) fetchChildren(selectedDistrict.code);
    }
  }, [visible, step, selectedProvince?.code, selectedDistrict?.code]);

  const handleSelectItem = (item: AddressItem) => {
    if (step === 1) {
      setSelectedProvince(item);
      setSelectedDistrict(null);
      setStep(2);
    } else if (step === 2) {
      setSelectedDistrict(item);
      setStep(3);
    } else if (step === 3) {
      // Complete
      if (selectedProvince && selectedDistrict) {
        onSelectComplete(selectedProvince.fullName, selectedDistrict.fullName, item.fullName);
        resetState();
      }
    }
  };

  const resetState = () => {
    setStep(1);
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setItems([]);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const goBackStep = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    } else {
      handleClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={goBackStep}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBackStep} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>{stepTitle}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Selected Breadcrumbs */}
        <View style={styles.breadcrumbs}>
          {selectedProvince && <Text style={styles.breadcrumbText}>{selectedProvince.name} {step > 1 ? '>' : ''}</Text>}
          {selectedDistrict && <Text style={styles.breadcrumbText}> {selectedDistrict.name} {step > 2 ? '>' : ''}</Text>}
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#F83758" />
          </View>
        ) : errorMessage ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                if (step === 1) fetchProvinces();
                else if (step === 2 && selectedProvince) fetchChildren(selectedProvince.code);
                else if (step === 3 && selectedDistrict) fetchChildren(selectedDistrict.code);
              }}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Không có dữ liệu.</Text>
            <Text style={styles.emptySubtitle}>Vui lòng quay lại hoặc thử lại.</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => handleSelectItem(item)}>
                <Text style={styles.itemText}>{item.fullName}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  backButton: { padding: 4 },
  closeButton: { padding: 4 },
  breadcrumbs: { flexDirection: 'row', padding: 12, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#eee' },
  breadcrumbText: { fontSize: 13, color: '#F83758' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#333', textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 8 },
  retryButton: { marginTop: 14, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F83758' },
  retryText: { color: '#fff', fontWeight: '600' },
  item: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  itemText: { fontSize: 15, color: '#333' }
});
