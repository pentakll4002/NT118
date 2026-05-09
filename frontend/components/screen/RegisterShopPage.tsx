import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { registerShop, uploadImage } from '../../lib/shopApi';
import { userApi } from '../../lib/userApi';
import AddressPickerModal from '../common/AddressPickerModal';
import Map from './Map';
import { forwardGeocodeNominatim } from '../../lib/geocode';

// Utility function to centralize slug generation
const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function RegisterShopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  
  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  // Address states
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [coord, setCoord] = useState<{ latitude: number; longitude: number }>({
    latitude: 10.844348,
    longitude: 106.79374,
  });
  const [coordSource, setCoordSource] = useState<'auto' | 'manual'>('auto');

  const fwdAbortRef = useRef<AbortController | null>(null);
  const fwdDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fwdRequestSeq = useRef(0);
  const startFwdRequest = () => {
    fwdRequestSeq.current += 1;
    return fwdRequestSeq.current;
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userApi.getProfile();
        if (profile) {
          setName(profile.name || '');
          setEmail(profile.email || '');
          setPhone(profile.phone || '');
          
          if (profile.name) {
            setSlug(generateSlug(profile.name));
          }
        }
      } catch (error) {
        console.log('Failed to fetch profile for pre-fill:', error);
      } finally {
        setFetchingProfile(false);
      }
    };
    loadProfile();
  }, []);

  // Auto-generate slug from name
  const handleNameChange = (text: string) => {
    setName(text);
    setSlug(generateSlug(text));
  };

  // Auto geocode address
  useEffect(() => {
    if (coordSource !== 'auto') return;
    const queryParts = [streetAddress, ward, district, province].map(x => x?.trim()).filter(Boolean);
    if (queryParts.length < 2) return;

    const reqId = startFwdRequest();
    fwdAbortRef.current?.abort();
    const controller = new AbortController();
    fwdAbortRef.current = controller;

    if (fwdDebounceRef.current) clearTimeout(fwdDebounceRef.current);
    fwdDebounceRef.current = setTimeout(async () => {
      try {
        const q = queryParts.join(', ');
        const res = await forwardGeocodeNominatim(q, { signal: controller.signal });
        if (!res) return;
        if (reqId !== fwdRequestSeq.current) return;
        if (coordSource !== 'auto') return;
        setCoord({ latitude: res.latitude, longitude: res.longitude });
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
      }
    }, 650);

    return () => {
      controller.abort();
      if (fwdDebounceRef.current) clearTimeout(fwdDebounceRef.current);
    };
  }, [coordSource, province, district, ward, streetAddress]);

  const pickImage = async (field: 'logo' | 'cover') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: field === 'logo' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        setLoading(true);
        const url = await uploadImage(result.assets[0].uri);
        if (field === 'logo') setLogoUrl(url);
        else setCoverImageUrl(url);
      } catch (error: any) {
        console.error("[UploadImage] Error:", error);
        Alert.alert('Lỗi tải ảnh', error.message || 'Server không phản hồi hoặc sai định dạng file.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !slug.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên shop và đường dẫn (slug).');
      return;
    }

    // Basic slug validation (regex: ^[a-z0-9]+(?:-[a-z0-9]+)*$)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      Alert.alert('Lỗi', 'Đường dẫn (slug) không hợp lệ. Chỉ dùng chữ cái thường, số và dấu gạch ngang.');
      return;
    }

    try {
      setLoading(true);
      const result = await registerShop({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        province: province.trim() || undefined,
        district: district.trim() || undefined,
        ward: ward.trim() || undefined,
        streetAddress: streetAddress.trim() || undefined,
        latitude: coord.latitude,
        longitude: coord.longitude,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
      });

      Alert.alert(
        '⏳ Đăng ký thành công!',
        `Cửa hàng "${result.name}" đã được tạo và đang chờ admin duyệt.\n\nThời gian duyệt thường 1–3 ngày làm việc. Bạn sẽ nhận thông báo khi được duyệt.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Register Shop Error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể đăng ký cửa hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#F83758" />
        <Text style={{ marginTop: 12, color: '#666' }}>Đang tải thông tin cá nhân...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#F83758" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký Cửa hàng</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <MaterialCommunityIcons name="storefront-plus" size={60} color="#F83758" />
          <Text style={styles.bannerTitle}>Bắt đầu bán hàng trên ShopeeLite</Text>
          <Text style={styles.bannerSubtitle}>Chỉ vài bước đơn giản để sở hữu gian hàng của riêng bạn</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên Shop <Text style={{color: '#F83758'}}>*</Text></Text>
            <View style={styles.inputWrap}>
              <TextInput 
                style={styles.input} 
                placeholder="Ví dụ: My Fashion Store" 
                value={name} 
                onChangeText={handleNameChange}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Đường dẫn Shop (Slug) <Text style={{color: '#F83758'}}>*</Text></Text>
            <View style={styles.inputWrap}>
              <Text style={styles.slugPrefix}>shopeelite.com/shop/</Text>
              <TextInput 
                style={[styles.input, {flex: 1}]} 
                placeholder="ten-shop-cua-ban" 
                value={slug} 
                onChangeText={setSlug}
                autoCapitalize="none"
              />
            </View>
            <Text style={styles.hint}>Chỉ chứa chữ thường, số và dấu gạch ngang.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả Shop</Text>
            <View style={[styles.inputWrap, {height: 100, alignItems: 'flex-start'}]}>
              <TextInput 
                style={[styles.input, {textAlignVertical: 'top'}]} 
                placeholder="Giới thiệu ngắn gọn về shop của bạn..." 
                value={description} 
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ & Địa chỉ</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputWrap}>
              <TextInput 
                style={styles.input} 
                placeholder="Số điện thoại liên hệ" 
                keyboardType="phone-pad"
                value={phone} 
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <TextInput 
                style={styles.input} 
                placeholder="Email của shop" 
                keyboardType="email-address"
                autoCapitalize="none"
                value={email} 
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { marginTop: 24 }]}>
            <Text style={styles.label}>Khu vực lấy hàng <Text style={{color: '#F83758'}}>*</Text></Text>
            <TouchableOpacity style={styles.pickerRow} onPress={() => setPickerVisible(true)}>
              <Text style={[styles.pickerText, !(province && district && ward) && {color: '#999'}]}>
                {(province && district && ward) ? `${ward}, ${district}, ${province}` : 'Chọn Tỉnh/Thành, Quận/Huyện...'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#BBBBBB" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ cụ thể</Text>
            <View style={styles.inputWrap}>
              <TextInput 
                style={styles.input} 
                placeholder="Số nhà, tên đường, tòa nhà..." 
                value={streetAddress} 
                onChangeText={(text) => { setStreetAddress(text); setCoordSource('auto'); }}
              />
            </View>
          </View>

          <View style={styles.mapWrap}>
            <Text style={styles.mapHint}>Chạm vào bản đồ để chọn chính xác vị trí lấy hàng.</Text>
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
              title="Vị trí lấy hàng"
              description={`${streetAddress || ''}${streetAddress ? ', ' : ''}${district || ''}`}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Hình ảnh đại diện (Tùy chọn)</Text>
          
          <View style={styles.imagePickerGroup}>
            <View style={styles.imagePickerCol}>
              <Text style={styles.label}>Logo Shop</Text>
              <TouchableOpacity style={styles.imageUploadBox} onPress={() => pickImage('logo')}>
                {logoUrl ? (
                  <Image source={{ uri: logoUrl }} style={styles.uploadedLogo} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="camera-outline" size={32} color="#999" />
                    <Text style={styles.uploadText}>Tải lên</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={[styles.imagePickerCol, { flex: 1.5 }]}>
              <Text style={styles.label}>Ảnh bìa (Cover)</Text>
              <TouchableOpacity style={[styles.imageUploadBox, { aspectRatio: 16/9 }]} onPress={() => pickImage('cover')}>
                {coverImageUrl ? (
                  <Image source={{ uri: coverImageUrl }} style={styles.uploadedCover} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="image-outline" size={32} color="#999" />
                    <Text style={styles.uploadText}>Tải lên</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.agreement}>
          <Ionicons name="checkbox" size={20} color="#F83758" />
          <Text style={styles.agreementText}>
            Bằng việc nhấn "Đăng ký", bạn đồng ý với các <Text style={styles.link}>Điều khoản & Chính sách</Text> người bán của chúng tôi.
          </Text>
        </View>
      </ScrollView>

      <AddressPickerModal 
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelectComplete={(p, d, w) => {
          setProvince(p);
          setDistrict(d);
          setWard(w);
          setCoordSource('auto');
          setPickerVisible(false);
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && {opacity: 0.7}]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>ĐĂNG KÝ NGAY</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEEEEE',
  },
  backButton: { paddingRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scrollContent: { paddingBottom: 30 },
  
  banner: {
    alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF'
  },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 16 },
  bannerSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 },
  
  formSection: { backgroundColor: '#FFFFFF', marginTop: 12, paddingBottom: 16 },
  sectionTitle: { 
    fontSize: 15, fontWeight: 'bold', color: '#333', 
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' 
  },
  
  inputGroup: { paddingHorizontal: 16, marginTop: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9F9F9', borderRadius: 8, borderWidth: 1, borderColor: '#EAEAEA',
    paddingHorizontal: 12, minHeight: 48
  },
  input: { flex: 1, fontSize: 15, color: '#333', paddingVertical: 10 },
  slugPrefix: { color: '#999', fontSize: 14, marginRight: 2 },
  hint: { fontSize: 12, color: '#999', marginTop: 4 },
  
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 8, borderWidth: 1, borderColor: '#EAEAEA', paddingHorizontal: 12, minHeight: 48 },
  pickerText: { fontSize: 15, color: '#333', flex: 1, paddingVertical: 10 },
  mapWrap: { paddingHorizontal: 16, paddingBottom: 12, marginTop: 12 },
  mapHint: { fontSize: 12, color: '#666', marginBottom: 8 },

  imagePickerGroup: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 16 },
  imagePickerCol: { flex: 1 },
  imageUploadBox: { 
    backgroundColor: '#F9F9F9', borderRadius: 8, borderWidth: 1, borderColor: '#EAEAEA', borderStyle: 'dashed',
    aspectRatio: 1, overflow: 'hidden', justifyContent: 'center', alignItems: 'center'
  },
  uploadPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: 12, color: '#999', marginTop: 4 },
  uploadedLogo: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadedCover: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  agreement: {
    flexDirection: 'row', padding: 20, alignItems: 'flex-start'
  },
  agreementText: { fontSize: 13, color: '#666', flex: 1, marginLeft: 8, lineHeight: 18 },
  link: { color: '#F83758', fontWeight: 'bold' },
  
  footer: {
    padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EEEEEE'
  },
  submitButton: {
    backgroundColor: '#F83758', borderRadius: 8, paddingVertical: 14, alignItems: 'center',
    shadowColor: '#F83758', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
