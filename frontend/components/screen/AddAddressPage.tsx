import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../lib/apiClient';
import AddressPickerModal from '../common/AddressPickerModal';
import Map from './Map';
import { forwardGeocodeNominatim, reverseGeocodeNominatim } from '../../lib/geocode';

interface AddAddressPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function AddAddressPage({ onBack, onSuccess }: AddAddressPageProps) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [addressType, setAddressType] = useState<'Văn phòng' | 'Nhà riêng'>('Nhà riêng');
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [coord, setCoord] = useState<{ latitude: number; longitude: number }>({
    latitude: 10.844348,
    longitude: 106.79374,
  });
  const [poiName, setPoiName] = useState<string | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string | null>(null);
  const [coordSource, setCoordSource] = useState<'auto' | 'manual'>('auto');
  const geoAbortRef = useRef<AbortController | null>(null);
  const geoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fwdAbortRef = useRef<AbortController | null>(null);
  const fwdDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fwdRequestSeq = useRef(0);
  const startFwdRequest = () => {
    fwdRequestSeq.current += 1;
    return fwdRequestSeq.current;
  };

  useEffect(() => {
    geoAbortRef.current?.abort();
    const controller = new AbortController();
    geoAbortRef.current = controller;

    if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current);
    geoDebounceRef.current = setTimeout(async () => {
      try {
        const res = await reverseGeocodeNominatim(coord.latitude, coord.longitude, { signal: controller.signal });
        setPoiName(res?.poiName || null);
        setFormattedAddress(res?.displayName || null);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setPoiName(null);
        setFormattedAddress(null);
      }
    }, 450);

    return () => {
      controller.abort();
      if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current);
    };
  }, [coord.latitude, coord.longitude]);

  useEffect(() => {
    if (coordSource !== 'auto') return;
    const queryParts = [streetAddress, ward, district, province].map(x => x?.trim()).filter(Boolean);
    if (queryParts.length < 2) return; // avoid overly broad queries

    const reqId = startFwdRequest();
    fwdAbortRef.current?.abort();
    const controller = new AbortController();
    fwdAbortRef.current = controller;

    if (fwdDebounceRef.current) clearTimeout(fwdDebounceRef.current);
    fwdDebounceRef.current = setTimeout(async () => {
      try {
        const q = queryParts.join(', ');
        console.log('>>> Forward geocode query:', q);
        const res = await forwardGeocodeNominatim(q, { signal: controller.signal });
        console.log('>>> Forward geocode result:', res);
        if (!res) return;
        if (reqId !== fwdRequestSeq.current) return;
        if (coordSource !== 'auto') return;
        setCoord({ latitude: res.latitude, longitude: res.longitude });
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        console.log('>>> Forward geocode error:', e?.message || e);
      }
    }, 650);

    return () => {
      controller.abort();
      if (fwdDebounceRef.current) clearTimeout(fwdDebounceRef.current);
    };
  }, [coordSource, province, district, ward, streetAddress]);

  const handleSave = async () => {
    if (!recipientName || !recipientPhone || !province || !district || !ward || !streetAddress) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/api/user/addresses', {
        recipientName,
        recipientPhone,
        province,
        district,
        ward,
        streetAddress,
        latitude: coord.latitude,
        longitude: coord.longitude,
        poiName,
        formattedAddress,
        isDefault
      });
      onSuccess();
    } catch (error) {
      console.log('Save Address Error: ', error);
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={26} color="#F83758" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa chỉ mới</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Smart paste section (mock UI as in shoppee design) */}
        <View style={styles.smartPasteBox}>
          <View style={styles.smartPasteHeader}>
            <Ionicons name="clipboard-outline" size={18} color="#F83758" />
            <Text style={styles.smartPasteTitle}> Dán và nhập nhanh</Text>
          </View>
          <Text style={styles.smartPasteDesc}>Dán hoặc nhập thông tin, nhận chọn Tự động điền để nhập tên, số điện thoại và địa chỉ.</Text>
          <View style={styles.smartPasteInput}>
            <Text style={{color: '#BBB'}}>Dán hoặc nhập thông tin, nhấn chọn Tự động điền để nhập tên, số điện thoại và địa chỉ</Text>
          </View>
        </View>

        {/* Inputs */}
        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Liên hệ</Text>
          <View style={styles.inputWrap}>
            <TextInput style={styles.input} placeholder="Họ và tên" value={recipientName} onChangeText={setRecipientName} />
          </View>
          <View style={styles.inputWrap}>
            <TextInput style={styles.input} placeholder="Số điện thoại" keyboardType="phone-pad" value={recipientPhone} onChangeText={setRecipientPhone} />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Địa chỉ</Text>
          
          <TouchableOpacity style={styles.pickerRow} onPress={() => setPickerVisible(true)}>
            <Text style={[styles.pickerText, !(province && district && ward) && {color: '#999'}]}>
              {(province && district && ward) ? `${ward}, ${district}, ${province}` : 'Tỉnh/Thành Phố, Quận/Huyện, Phường/Xã'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#BBBBBB" />
          </TouchableOpacity>

          <View style={styles.inputWrap}>
            <TextInput style={styles.input} placeholder="Tên đường, Toà nhà, Số nhà." value={streetAddress} onChangeText={setStreetAddress} />
          </View>

          <View style={styles.mapWrap}>
            <Text style={styles.mapHint}>Chạm vào bản đồ để chọn vị trí giao hàng.</Text>
            <Map
              latitude={coord.latitude}
              longitude={coord.longitude}
              interactive
              onCoordinateChange={(c) => {
                fwdAbortRef.current?.abort();
                if (fwdDebounceRef.current) clearTimeout(fwdDebounceRef.current);
                startFwdRequest();
                setCoordSource('manual');
                setCoord(c);
              }}
              title={poiName || 'Vị trí giao hàng'}
              description={formattedAddress || `${streetAddress || ''}${streetAddress ? ', ' : ''}${district || ''}`}
            />
          </View>
        </View>

        <AddressPickerModal 
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onSelectComplete={(p, d, w) => {
            setProvince(p);
            setDistrict(d);
            setWard(w);
            setCoordSource('auto');
            setPoiName(null);
            setFormattedAddress(null);
            setPickerVisible(false);
          }}
        />

        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Đặt làm địa chỉ mặc định</Text>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: "#d3d3d3", true: "#ffcdd2" }}
              thumbColor={isDefault ? "#F83758" : "#f4f3f4"}
            />
          </View>
          
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.settingText}>Loại địa chỉ:</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity 
                style={[styles.chip, addressType === 'Văn phòng' && styles.chipActive]}
                onPress={() => setAddressType('Văn phòng')}
              >
                <Text style={addressType === 'Văn phòng' ? styles.chipTextActive : styles.chipText}>Văn phòng</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.chip, addressType === 'Nhà riêng' && styles.chipActive]}
                onPress={() => setAddressType('Nhà riêng')}
              >
                <Text style={addressType === 'Nhà riêng' ? styles.chipTextActive : styles.chipText}>Nhà riêng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>HOÀN THÀNH</Text>}
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
  scrollContent: { paddingBottom: 20 },
  smartPasteBox: {
    margin: 12, padding: 12, backgroundColor: '#FFF5F5', borderRadius: 8, borderWidth: 1, borderColor: '#FFE4E4'
  },
  smartPasteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  smartPasteTitle: { color: '#F83758', fontWeight: 'bold' },
  smartPasteDesc: { fontSize: 12, color: '#555', marginBottom: 8 },
  smartPasteInput: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#EEEEEE' },
  
  formGroup: { backgroundColor: '#FFFFFF', marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', padding: 12, backgroundColor: '#F9F9F9' },
  inputWrap: { borderBottomWidth: 1, borderBottomColor: '#EEEEEE', marginHorizontal: 16 },
  input: { paddingVertical: 14, fontSize: 15, color: '#333' },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  pickerText: { fontSize: 15, color: '#333', flex: 1 },
  mapWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  mapHint: { fontSize: 12, color: '#666', marginTop: 10 },
  
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#EEEEEE'
  },
  settingText: { fontSize: 15, color: '#333' },
  chipRow: { flexDirection: 'row' },
  chip: {
    borderWidth: 1, borderColor: '#EEEEEE', borderRadius: 4, paddingVertical: 6, paddingHorizontal: 12, marginLeft: 8
  },
  chipActive: { borderColor: '#F83758' },
  chipText: { fontSize: 13, color: '#666' },
  chipTextActive: { fontSize: 13, color: '#F83758' },
  
  bottomBar: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  submitButton: { backgroundColor: '#F83758', borderRadius: 4, paddingVertical: 14, alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
