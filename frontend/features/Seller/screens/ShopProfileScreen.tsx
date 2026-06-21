import React, { useMemo, useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import BottomTabBar from '../components/BottomTabBar';
import Header from '../components/Header';
import { sellerApi, ShopProfile } from '@/lib/sellerApi';
import { Colors } from '@/constants/theme';
import Map from '@/components/screen/Map';
import { forwardGeocodeNominatim } from '@/lib/geocode';

const ShopProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<ShopProfile>>({});

  const [coordSource, setCoordSource] = useState<'auto' | 'manual'>('manual');
  const fwdAbortRef = React.useRef<AbortController | null>(null);
  const fwdDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchShopInfo();
  }, []);

  // Auto geocode when address changes
  useEffect(() => {
    if (coordSource !== 'auto') return;
    if (!profile.address || profile.address.trim().length < 5) return;

    fwdAbortRef.current?.abort();
    const controller = new AbortController();
    fwdAbortRef.current = controller;

    if (fwdDebounceRef.current) clearTimeout(fwdDebounceRef.current);
    fwdDebounceRef.current = setTimeout(async () => {
      try {
        const res = await forwardGeocodeNominatim(profile.address!, { signal: controller.signal });
        if (res && coordSource === 'auto') {
          setProfile((prev) => ({
            ...prev,
            latitude: res.latitude,
            longitude: res.longitude
          }));
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
      }
    }, 850);

    return () => {
      controller.abort();
      if (fwdDebounceRef.current) clearTimeout(fwdDebounceRef.current);
    };
  }, [profile.address, coordSource]);

  const fetchShopInfo = async () => {
    try {
      setLoading(true);
      const data = await sellerApi.getShopInfo();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch shop info:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const res = await sellerApi.updateShopProfile({
        name: profile.name,
        description: profile.description,
        address: profile.address,
        phone: profile.phone,
        email: profile.email,
        businessHours: profile.businessHours,
        pickupAddress: profile.pickupAddress,
        latitude: profile.latitude,
        longitude: profile.longitude,
      });
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Thông báo', res.message || 'Đã cập nhật thông tin cửa hàng');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể lưu thay đổi');
    } finally {
      setSaving(false);
    }
  };

  const completion = useMemo(() => {
    if (!profile) return 0;
    const fields = ['name', 'description', 'address', 'phone', 'businessHours'];
    const filled = fields.filter(f => (profile as any)[f]?.trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, color: '#6b7280' }}>Đang tải thông tin shop...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        shopName={profile.name || 'Hồ sơ Shop'} 
        rightIcon="checkmark"
        onRightPress={handleSave}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >

        <View style={styles.topSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarInner}>
              <MaterialCommunityIcons name="storefront-outline" size={32} color={Colors.light.primary} />
            </View>
            <TouchableOpacity style={styles.editAvatarBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Ionicons name="camera" size={10} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.identityText}>
            <Text style={styles.shopNameText}>{profile.name || 'Cửa hàng của tôi'}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, profile.isVerified ? styles.verifiedBadge : styles.newBadge]}>
                <MaterialCommunityIcons 
                  name={profile.isVerified ? "check-decagram" : "star-circle"} 
                  size={12} 
                  color="#fff" 
                />
                <Text style={styles.statusBadgeText}>
                  {profile.isVerified ? 'NHÀ BÁN HÀNG UY TÍN' : 'CỬA HÀNG MỚI'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {profile.status === 'pending' && (
          <View style={styles.pendingBanner}>
            <View style={styles.pendingIconBg}>
              <Ionicons name="time" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.pendingTitle}>Đang chờ duyệt</Text>
              <Text style={styles.pendingSubtitle}>Hồ sơ của bạn đang được đội ngũ admin xem xét. Quá trình này thường mất 1–3 ngày làm việc.</Text>
            </View>
          </View>
        )}

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Độ hoàn thiện hồ sơ</Text>
            <Text style={styles.progressValueText}>{completion}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${completion}%`, backgroundColor: Colors.light.primary }]} />
          </View>
        </View>

        {/* Form Sections */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Feather name="shopping-bag" size={16} color={Colors.light.primary} />
                <Text style={styles.inputLabel}>Tên Shop</Text>
              </View>
              <TextInput
                value={profile.name}
                onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
                style={styles.textInput}
                placeholder="Ví dụ: Elite Store"
                placeholderTextColor="#A29DBA"
              />
            </View>

            <View style={[styles.inputGroup, { borderBottomWidth: 0 }]}>
              <View style={styles.labelRow}>
                <Feather name="file-text" size={16} color={Colors.light.primary} />
                <Text style={styles.inputLabel}>Mô tả Shop</Text>
              </View>
              <TextInput
                value={profile.description}
                onChangeText={(text) => setProfile((prev) => ({ ...prev, description: text }))}
                style={[styles.textInput, styles.textArea]}
                multiline
                placeholder="Kể cho khách hàng nghe về shop của bạn..."
                placeholderTextColor="#A29DBA"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Liên hệ & Địa chỉ</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Feather name="phone" size={16} color={Colors.light.primary} />
                <Text style={styles.inputLabel}>Số điện thoại</Text>
              </View>
              <TextInput
                value={profile.phone}
                onChangeText={(text) => setProfile((prev) => ({ ...prev, phone: text }))}
                style={styles.textInput}
                keyboardType="phone-pad"
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#A29DBA"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Feather name="map-pin" size={16} color={Colors.light.primary} />
                <Text style={styles.inputLabel}>Địa chỉ Shop</Text>
              </View>
              <TextInput
                value={profile.address}
                onChangeText={(text) => {
                  setProfile((prev) => ({ ...prev, address: text }));
                  setCoordSource('auto');
                }}
                style={styles.textInput}
                placeholder="Địa chỉ hiển thị trên shop"
                placeholderTextColor="#A29DBA"
              />
            </View>

            <View style={styles.mapWrap}>
              <Text style={styles.mapHint}>Chạm vào bản đồ để chọn chính xác vị trí cửa hàng.</Text>
              <Map
                latitude={profile.latitude || 10.7712}
                longitude={profile.longitude || 106.6979}
                interactive
                onCoordinateChange={(c) => {
                  setCoordSource('manual');
                  setProfile((prev) => ({
                    ...prev,
                    latitude: c.latitude,
                    longitude: c.longitude
                  }));
                }}
                title="Vị trí cửa hàng"
                description={profile.address || "Địa chỉ shop"}
              />
            </View>

            <View style={[styles.inputGroup, { borderBottomWidth: 0 }]}>
              <View style={styles.labelRow}>
                <Feather name="truck" size={16} color={Colors.light.primary} />
                <Text style={styles.inputLabel}>Địa chỉ lấy hàng</Text>
              </View>
              <TextInput
                value={profile.pickupAddress}
                onChangeText={(text) => setProfile((prev) => ({ ...prev, pickupAddress: text }))}
                style={styles.textInput}
                placeholder="Địa chỉ kho hàng"
                placeholderTextColor="#A29DBA"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Vận hành</Text>
          <View style={styles.card}>
            <View style={[styles.inputGroup, { borderBottomWidth: 0 }]}>
              <View style={styles.labelRow}>
                <Feather name="clock" size={16} color={Colors.light.primary} />
                <Text style={styles.inputLabel}>Giờ hoạt động</Text>
              </View>
              <TextInput
                value={profile.businessHours}
                onChangeText={(text) => setProfile((prev) => ({ ...prev, businessHours: text }))}
                style={styles.textInput}
                placeholder="Ví dụ: 08:00 - 22:00"
                placeholderTextColor="#A29DBA"
              />
            </View>
          </View>
        </View>

        <View style={styles.footerSpacing} />
      </ScrollView>

      {/* Floating Action Button for Saving */}
      <View style={[styles.fabContainer, { bottom: Math.max(insets.bottom + 85, 95) }]}>
        <TouchableOpacity 
          style={[styles.saveFab, saving && styles.disabledFab]} 
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.saveFabText}>Lưu thay đổi</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topSection: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 21, 48, 0.03)',
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 3,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: '#FFF1F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: Colors.light.primary,
    width: 20,
    height: 20,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: {
    flex: 1,
    marginLeft: 16,
    paddingBottom: 4,
  },
  shopNameText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1B1530',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifiedBadge: {
    backgroundColor: Colors.light.primary,
  },
  newBadge: {
    backgroundColor: '#FF7C7C',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  progressCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#1B1530',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B1530',
  },
  progressValueText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#FFF1F3',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7C5CFF',
    borderRadius: 4,
  },
  sectionContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#A29DBA',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#1B1530',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FDF2F4',
    paddingBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B1530',
    marginLeft: 8,
  },
  textInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B1530',
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footerSpacing: {
    height: 120,
  },
  fabContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  saveFab: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    width: '100%',
    justifyContent: 'center',
  },
  saveFabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  disabledFab: {
    opacity: 0.6,
  },
  pendingBanner: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  pendingSubtitle: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 18,
    fontWeight: '500',
  },
  mapWrap: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
});

export default ShopProfileScreen;
