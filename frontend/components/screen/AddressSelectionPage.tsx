import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserAddressType } from '../common/PaymentAddressSection';
import { apiClient } from '../../lib/apiClient';

interface AddressSelectionPageProps {
  onBack: () => void;
  onSelectAddress: (address: UserAddressType) => void;
  onAddNewRequest: () => void;
  currentAddressId?: number;
}

export default function AddressSelectionPage({ onBack, onSelectAddress, onAddNewRequest, currentAddressId }: AddressSelectionPageProps) {
  const [addresses, setAddresses] = useState<UserAddressType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/user/addresses');
      const data = response.data?.data || response.data;
      setAddresses(data || []);
    } catch (error) {
      console.log('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const setDefaultAndSelect = async (address: UserAddressType) => {
    try {
      setLoading(true);
      await apiClient.put(`/api/user/addresses/${address.id}`, {
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone,
        province: address.province,
        district: address.district,
        ward: address.ward,
        streetAddress: address.streetAddress,
        latitude: address.latitude ?? null,
        longitude: address.longitude ?? null,
        poiName: address.poiName ?? null,
        formattedAddress: address.formattedAddress ?? null,
        isDefault: true,
      });

      const response = await apiClient.get('/api/user/addresses');
      const data = response.data?.data || response.data;
      const next: UserAddressType[] = data || [];
      setAddresses(next);
      const picked = next.find(x => x.id === address.id) || next[0] || address;
      onSelectAddress(picked);
    } catch (error) {
      console.log('Error setting default address:', error);
      onSelectAddress(address);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: UserAddressType }) => {
    const isSelected = item.id === currentAddressId;

    return (
      <TouchableOpacity 
        style={styles.addressItem} 
        onPress={() => setDefaultAndSelect(item)}
      >
        <View style={styles.radioContainer}>
          <Ionicons 
            name={isSelected ? "radio-button-on" : "radio-button-off"} 
            size={24} 
            color={isSelected ? "#F83758" : "#999"} 
          />
        </View>
        <View style={styles.addressContent}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{item.recipientName}</Text>
            <Text style={styles.phoneText}> | {item.recipientPhone}</Text>
          </View>
          <Text style={styles.addressDetail}>{item.streetAddress}</Text>
          <Text style={styles.addressDetail}>{item.ward}, {item.district}, {item.province}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Mặc định</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editText}>Sửa</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={26} color="#F83758" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn địa chỉ nhận hàng</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#F83758" />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<Text style={styles.listHeader}>Địa chỉ</Text>}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Bạn chưa có địa chỉ nào.</Text>
          }
        />
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addButton} onPress={onAddNewRequest}>
          <Ionicons name="add" size={20} color="#F83758" />
          <Text style={styles.addButtonText}>Thêm Địa Chỉ Mới</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEEEEE',
  },
  backButton: { paddingRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '500', color: '#333333' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 20 },
  listHeader: { padding: 12, fontSize: 14, color: '#666', backgroundColor: '#F5F5F5' },
  addressItem: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#EEEEEE', alignItems: 'flex-start'
  },
  radioContainer: { marginRight: 12, marginTop: 2 },
  addressContent: { flex: 1, paddingRight: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  nameText: { fontSize: 15, fontWeight: '600', color: '#333' },
  phoneText: { fontSize: 14, color: '#666' },
  addressDetail: { fontSize: 13, color: '#555', lineHeight: 18 },
  defaultBadge: {
    marginTop: 6, alignSelf: 'flex-start', borderWidth: 1,
    borderColor: '#F83758', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2
  },
  defaultBadgeText: { color: '#F83758', fontSize: 11 },
  editButton: { paddingLeft: 12 },
  editText: { color: '#999', fontSize: 14 },
  bottomBar: { backgroundColor: '#FFFFFF', padding: 16, borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#F83758', paddingVertical: 12, borderRadius: 4
  },
  addButtonText: { color: '#F83758', fontSize: 16, fontWeight: '500', marginLeft: 8 },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#888' },
});
