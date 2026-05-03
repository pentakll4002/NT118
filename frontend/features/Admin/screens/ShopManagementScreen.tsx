import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  RefreshControl, TouchableOpacity, TextInput, ActivityIndicator,
  Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, AdminShopDTO, PendingShopDTO } from '@/lib/adminApi';
import { useRouter } from 'expo-router';

type FilterType = 'all' | 'pending' | 'active' | 'suspended';

const ShopManagementScreen: React.FC = () => {
  const router = useRouter();
  const [shops, setShops] = useState<AdminShopDTO[]>([]);
  const [pendingShops, setPendingShops] = useState<PendingShopDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [rejectModal, setRejectModal] = useState<{ visible: boolean; shopId: number; shopName: string }>({ visible: false, shopId: 0, shopName: '' });
  const [rejectReason, setRejectReason] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [allShops, pending] = await Promise.all([
        adminApi.getShops(),
        adminApi.getPendingShops().catch(() => []),
      ]);
      setShops(Array.isArray(allShops) ? allShops : []);
      setPendingShops(Array.isArray(pending) ? pending : []);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể tải danh sách');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, [fetchData]);

  const filteredShops = useMemo(() => {
    const list = filter === 'pending'
      ? pendingShops.map(s => ({ ...s, totalProducts: 0, rating: 0, owner: s.owner } as AdminShopDTO))
      : shops;
    return list.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchSearch = s.name.toLowerCase().includes(q) || s.slug?.toLowerCase().includes(q);
      if (filter === 'all' || filter === 'pending') return matchSearch;
      return matchSearch && s.status === filter;
    });
  }, [shops, pendingShops, searchQuery, filter]);

  const handleApprove = (shop: AdminShopDTO | PendingShopDTO) => {
    Alert.alert('Duyệt cửa hàng', `Phê duyệt "${shop.name}"?\nChủ shop sẽ được nâng thành Seller.`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Duyệt', onPress: async () => {
        try {
          await adminApi.approveShop(shop.id);
          Alert.alert('✅ Thành công', `Đã duyệt "${shop.name}".`);
          fetchData();
        } catch (e: any) { Alert.alert('Lỗi', e.message); }
      }},
    ]);
  };

  const handleReject = async () => {
    try {
      await adminApi.rejectShop(rejectModal.shopId, rejectReason || undefined);
      Alert.alert('Đã từ chối', `Đã từ chối "${rejectModal.shopName}".`);
      setRejectModal({ visible: false, shopId: 0, shopName: '' });
      setRejectReason('');
      fetchData();
    } catch (e: any) { Alert.alert('Lỗi', e.message); }
  };

  const handleToggleVerify = async (shop: AdminShopDTO) => {
    try {
      await adminApi.toggleShopVerified(shop.id, !shop.isVerified);
      Alert.alert('Thành công', `Đã ${shop.isVerified ? 'hủy' : ''} xác minh "${shop.name}".`);
      fetchData();
    } catch (e: any) { Alert.alert('Lỗi', e.message); }
  };

  const handleToggleStatus = async (shop: AdminShopDTO) => {
    const newStatus = shop.status === 'active' ? 'suspended' : 'active';
    try {
      await adminApi.updateShopStatus(shop.id, newStatus);
      Alert.alert('Thành công', `Đã ${newStatus === 'active' ? 'mở khóa' : 'tạm ngưng'} "${shop.name}".`);
      fetchData();
    } catch (e: any) { Alert.alert('Lỗi', e.message); }
  };

  const statusColor = (s: string) => {
    if (s === 'active') return { bg: '#dcfce7', fg: '#166534' };
    if (s === 'pending') return { bg: '#fef3c7', fg: '#92400e' };
    return { bg: '#fee2e2', fg: '#991b1b' };
  };

  if (loading && !refreshing) return (
    <SafeAreaView style={s.container}><View style={s.center}><ActivityIndicator size="large" color="#4392F9" /></View></SafeAreaView>
  );

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Quản lý cửa hàng</Text>
          <Text style={s.headerSub}>{shops.length} shop • {pendingShops.length} chờ duyệt</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <View style={s.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {([
            { id: 'all', label: `Tất cả (${shops.length})` },
            { id: 'pending', label: `⏳ Chờ duyệt (${pendingShops.length})` },
            { id: 'active', label: 'Đang hoạt động' },
            { id: 'suspended', label: 'Tạm ngưng' },
          ] as { id: FilterType; label: string }[]).map(t => (
            <TouchableOpacity key={t.id} style={[s.filterTab, filter === t.id && s.filterTabOn]} onPress={() => setFilter(t.id)}>
              <Text style={[s.filterTabTxt, filter === t.id && s.filterTabTxtOn]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={s.searchBar}>
        <View style={s.searchInner}>
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput style={s.searchInput} placeholder="Tìm cửa hàng..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#94a3b8" />
        </View>
      </View>

      <ScrollView contentContainerStyle={s.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {filteredShops.map(shop => {
          const sc = statusColor(shop.status);
          const isPending = shop.status === 'pending';
          return (
            <View key={shop.id} style={[s.card, isPending && s.cardPending]}>
              {isPending && <View style={s.pendingBanner}><Ionicons name="time-outline" size={14} color="#92400e" /><Text style={s.pendingBannerTxt}>Đang chờ admin duyệt</Text></View>}
              <View style={s.cardHeader}>
                <View style={s.shopIcon}><Ionicons name="storefront" size={22} color="#4392F9" /></View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.shopName} numberOfLines={1}>{shop.name}</Text>
                    {shop.isVerified && <Ionicons name="checkmark-circle" size={16} color="#4392F9" />}
                  </View>
                  <Text style={s.shopSlug}>@{shop.slug}</Text>
                  {shop.owner && <Text style={s.ownerTxt}>👤 {shop.owner.username} ({shop.owner.email})</Text>}
                </View>
                <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[s.statusTxt, { color: sc.fg }]}>{shop.status}</Text>
                </View>
              </View>

              {!isPending && (
                <View style={s.statsRow}>
                  <View style={s.statItem}><Text style={s.statVal}>{shop.totalProducts}</Text><Text style={s.statLbl}>Sản phẩm</Text></View>
                  <View style={s.statDiv} />
                  <View style={s.statItem}><Text style={s.statVal}>{shop.rating}★</Text><Text style={s.statLbl}>Đánh giá</Text></View>
                  <View style={s.statDiv} />
                  <View style={s.statItem}><Text style={s.statVal}>{new Date(shop.createdAt).toLocaleDateString('vi-VN')}</Text><Text style={s.statLbl}>Ngày tạo</Text></View>
                </View>
              )}

              <View style={s.actions}>
                {isPending ? (
                  <>
                    <TouchableOpacity style={[s.actBtn, { backgroundColor: '#dcfce7', borderColor: '#86efac' }]} onPress={() => handleApprove(shop)}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#16a34a" />
                      <Text style={[s.actBtnTxt, { color: '#16a34a' }]}>Duyệt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.actBtn, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]} onPress={() => setRejectModal({ visible: true, shopId: shop.id, shopName: shop.name })}>
                      <Ionicons name="close-circle-outline" size={18} color="#dc2626" />
                      <Text style={[s.actBtnTxt, { color: '#dc2626' }]}>Từ chối</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={[s.actBtn, { borderColor: '#e2e8f0' }]} onPress={() => handleToggleVerify(shop)}>
                      <Ionicons name={shop.isVerified ? 'shield-checkmark' : 'shield-outline'} size={16} color="#64748b" />
                      <Text style={s.actBtnTxt}>{shop.isVerified ? 'Hủy XM' : 'Xác minh'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.actBtn, { borderColor: shop.status === 'active' ? '#fca5a5' : '#86efac' }]} onPress={() => handleToggleStatus(shop)}>
                      <Ionicons name={shop.status === 'active' ? 'lock-closed-outline' : 'lock-open-outline'} size={16} color={shop.status === 'active' ? '#ef4444' : '#10b981'} />
                      <Text style={[s.actBtnTxt, { color: shop.status === 'active' ? '#ef4444' : '#10b981' }]}>{shop.status === 'active' ? 'Ngưng' : 'Mở'}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          );
        })}
        {filteredShops.length === 0 && (
          <View style={s.empty}><Ionicons name="business-outline" size={64} color="#e2e8f0" /><Text style={s.emptyTxt}>Không tìm thấy cửa hàng nào</Text></View>
        )}
      </ScrollView>

      <Modal visible={rejectModal.visible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Từ chối cửa hàng</Text>
            <Text style={s.modalSub}>Shop: <Text style={{ fontWeight: '700' }}>{rejectModal.shopName}</Text></Text>
            <TextInput style={s.reasonInput} placeholder="Lý do từ chối (không bắt buộc)..." value={rejectReason} onChangeText={setRejectReason} multiline numberOfLines={3} placeholderTextColor="#94a3b8" />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setRejectModal({ visible: false, shopId: 0, shopName: '' }); setRejectReason(''); }}>
                <Text style={s.cancelBtnTxt}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.rejectBtn} onPress={handleReject}>
                <Text style={s.rejectBtnTxt}>Từ chối</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', textAlign: 'center' },
  headerSub: { fontSize: 12, color: '#64748b', textAlign: 'center', fontWeight: '500' },
  filterWrap: { backgroundColor: '#fff', paddingVertical: 10 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  filterTabOn: { backgroundColor: '#4392F9', borderColor: '#4392F9' },
  filterTabTxt: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  filterTabTxtOn: { color: '#fff' },
  searchBar: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  searchInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1e293b' },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  cardPending: { borderColor: '#fde68a', borderWidth: 2 },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 12 },
  pendingBannerTxt: { fontSize: 12, fontWeight: '700', color: '#92400e' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  shopIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  shopName: { fontSize: 16, fontWeight: '700', color: '#1e293b', flexShrink: 1 },
  shopSlug: { fontSize: 11, color: '#94a3b8' },
  ownerTxt: { fontSize: 11, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusTxt: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#f8fafc', borderRadius: 12, paddingVertical: 12, marginBottom: 12 },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  statLbl: { fontSize: 10, color: '#64748b', marginTop: 2 },
  statDiv: { width: 1, height: '60%', backgroundColor: '#e2e8f0', alignSelf: 'center' as const },
  actions: { flexDirection: 'row', gap: 10 },
  actBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  actBtnTxt: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  empty: { padding: 60, alignItems: 'center' },
  emptyTxt: { marginTop: 16, color: '#94a3b8', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
  modalSub: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  reasonInput: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, fontSize: 14, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0', minHeight: 80, textAlignVertical: 'top', marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
  cancelBtnTxt: { fontSize: 16, fontWeight: '700', color: '#64748b' },
  rejectBtn: { flex: 2, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#dc2626' },
  rejectBtnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default ShopManagementScreen;
