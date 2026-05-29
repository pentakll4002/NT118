import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProductCard from '../common/ProductCard';
import { getShopById, getShopProducts, toggleFollowShop, getFollowStatus, ShopDetailResponse, ShopDTO } from '../../lib/shopApi';
import { ProductDTO, formatPriceFull, formatSold } from '../../lib/productApi';
import { toggleFavorite } from '../../lib/wishlistApi';
import { apiClient } from '../../lib/apiClient';

const { width } = Dimensions.get('window');

interface ShopPageProps { shopId: number; }

const ShopPage: React.FC<ShopPageProps> = ({ shopId = 1 }) => {
  const router = useRouter();
  const [shop, setShop] = useState<ShopDetailResponse | null>(null);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [shopVouchers, setShopVouchers] = useState<any[]>([]);
  const [savedVoucherIds, setSavedVoucherIds] = useState<Set<number>>(new Set());

  useEffect(() => { loadShopData(); }, [shopId]);

  const loadShopData = async () => {
    try {
      setLoading(true);
      const [shopData, productData, followData] = await Promise.all([
        getShopById(shopId), getShopProducts(shopId), getFollowStatus(shopId)
      ]);
      setShop(shopData);
      setProducts(productData);
      setIsFollowing(followData.isFollowing);

      // Fetch shop vouchers
      try {
        const vRes = await apiClient.get('/api/vouchers');
        const vData = vRes.data?.data || vRes.data || [];
        setShopVouchers(vData.slice(0, 5)); // Show up to 5 vouchers
      } catch { /* no vouchers */ }
    } catch (err) { console.error('Failed to load shop data:', err); }
    finally { setLoading(false); }
  };

  const handleFollow = async () => {
    const success = await toggleFollowShop(shopId, isFollowing);
    if (success) {
      setIsFollowing(!isFollowing);
      // Update follower count locally
      setShop(prev => prev ? {
        ...prev,
        followerCount: isFollowing 
          ? Math.max(0, (prev.followerCount ?? 0) - 1) 
          : (prev.followerCount ?? 0) + 1
      } : prev);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem cửa hàng ${shop?.name} trên ShopeeLite!`,
        title: shop?.name || 'Cửa hàng',
      });
    } catch (err) { console.error('Share failed:', err); }
  };

  const handleChat = () => {
    if (shop?.ownerId) {
      router.push({
        pathname: '/chat/[id]',
        params: { id: shop.ownerId.toString(), name: shop.name }
      } as any);
    } else {
      Alert.alert('Thông báo', 'Không thể liên hệ cửa hàng lúc này.');
    }
  };

  const handleToggleFavorite = async (product: any) => {
    const id = Number(product.id);
    setFavoriteIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    try { await toggleFavorite(id); } catch { /* ignore in mock mode */ }
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#F83758" />
      <Text style={styles.loadingText}>Đang tải thông tin cửa hàng...</Text>
    </View>
  );

  if (!shop) return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#CCC" />
      <Text style={styles.errorText}>Không tìm thấy cửa hàng.</Text>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );

  const formattedProducts = products.map(dto => ({
    id: dto.id, name: dto.name, description: dto.description || '',
    price: formatPriceFull(dto.price),
    originalPrice: dto.originalPrice ? formatPriceFull(dto.originalPrice) : undefined,
    discount: dto.discount > 0 ? `-${dto.discount}%` : undefined,
    rating: dto.rating, reviews: formatSold(dto.soldQuantity),
    image: dto.image ? { uri: dto.image } : require('../../assets/images/product/product-1.png'),
    imageHeight: 180,
  }));

  const tabs = [
    { key: 'main', label: 'Cửa hàng' },
    { key: 'all', label: 'Tất cả' },
    { key: 'categories', label: 'Phân loại' },
  ];

  const renderTabContent = () => {
    if (activeTab === 'main') {
      return (
        <View style={styles.mainTabContent}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}><Ionicons name="location-outline" size={18} color="#666" /><Text style={styles.infoText}>{shop.address || 'Chưa cập nhật'}</Text></View>
            <View style={styles.infoRow}><Ionicons name="call-outline" size={18} color="#666" /><Text style={styles.infoText}>{shop.phone || 'Chưa cập nhật'}</Text></View>
            <View style={styles.infoRow}><Ionicons name="mail-outline" size={18} color="#666" /><Text style={styles.infoText}>{shop.email || 'Chưa cập nhật'}</Text></View>
          </View>
          {shop.description && (
            <View style={styles.descCard}>
              <Text style={styles.descTitle}>Giới thiệu</Text>
              <Text style={styles.descText}>{shop.description}</Text>
            </View>
          )}
          <Text style={styles.sectionLabel}>Sản phẩm nổi bật</Text>
          <View style={styles.productsGrid}>
            {formattedProducts.slice(0, 4).map(item => (
              <ProductCard key={item.id} product={item as any}
                onPress={(p) => router.push(`/product/${p.id}` as any)}
                isFavorited={favoriteIds.has(Number(item.id))}
                onToggleFavorite={handleToggleFavorite} />
            ))}
          </View>
        </View>
      );
    }
    if (activeTab === 'categories') {
      const categoryNames = ['Tất cả', 'Bán chạy', 'Mới nhất', 'Giá thấp'];
      return (
        <View style={styles.catContent}>
          <View style={styles.catChips}>
            {categoryNames.map((c, i) => (
              <TouchableOpacity key={c} style={[styles.catChip, i === 0 && styles.catChipActive]}>
                <Text style={[styles.catChipText, i === 0 && styles.catChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.productsGrid}>
            {formattedProducts.map(item => (
              <ProductCard key={item.id} product={item as any}
                onPress={(p) => router.push(`/product/${p.id}` as any)}
                isFavorited={favoriteIds.has(Number(item.id))}
                onToggleFavorite={handleToggleFavorite} />
            ))}
          </View>
        </View>
      );
    }
    // 'all' tab
    return (
      <View style={styles.productsGrid}>
        {formattedProducts.map(item => (
          <ProductCard key={item.id} product={item as any}
            onPress={(p) => router.push(`/product/${p.id}` as any)}
            isFavorited={favoriteIds.has(Number(item.id))}
            onToggleFavorite={handleToggleFavorite} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/search' as any)}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.searchText}>Tìm trong shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Image source={{ uri: shop.coverImageUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000' }} style={styles.coverImage} />
          <View style={styles.overlay} />
          <View style={styles.shopMainInfo}>
            <View style={styles.logoContainer}>
              {shop.logoUrl ? <Image source={{ uri: shop.logoUrl }} style={styles.logo} />
                : <Text style={styles.logoPlaceholder}>{shop.name[0]}</Text>}
            </View>
            <View style={styles.nameContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.shopName}>{shop.name}</Text>
                {shop.isVerified && <MaterialCommunityIcons name="check-decagram" size={16} color="#4CC9F0" />}
              </View>
              <Text style={styles.onlineStatus}>Online</Text>
            </View>
            <TouchableOpacity style={[styles.followButton, isFollowing && styles.followingButton]} onPress={handleFollow}>
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? 'Đang theo dõi' : '+ Theo dõi'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}><Text style={styles.statValue}>{shop.rating}</Text><Text style={styles.statLabel}> Đánh giá</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statValue}>{shop.totalProducts}</Text><Text style={styles.statLabel}> Sản phẩm</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{shop.followerCount ?? 0}</Text>
              <Text style={styles.statLabel}>Người theo dõi</Text>
            </View>
          </View>
        </View>

        {/* Vouchers */}
        <View style={styles.vouchersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vouchersScroll}>
            {shopVouchers.length > 0 ? shopVouchers.map(v => {
              const isSaved = savedVoucherIds.has(v.id);
              const displayVal = v.discountType === 'Percentage' 
                ? `${v.discountValue}%` 
                : `${Math.round(v.discountValue / 1000)}k`;
              return (
                <View key={v.id} style={styles.voucherCard}>
                  <View style={styles.voucherLeft}><Text style={styles.voucherLabel}>Giảm</Text><Text style={styles.voucherAmount}>{displayVal}</Text></View>
                  <TouchableOpacity 
                    style={[styles.voucherRight, isSaved && { backgroundColor: '#999' }]}
                    disabled={isSaved}
                    onPress={async () => {
                      try {
                        await apiClient.post(`/api/vouchers/${v.id}/claim`);
                        setSavedVoucherIds(prev => new Set(prev).add(v.id));
                      } catch (e: any) {
                        const msg = e?.response?.data?.message || 'Không thể lưu voucher';
                        Alert.alert('Thông báo', msg);
                      }
                    }}
                  >
                    <Text style={styles.voucherAction}>{isSaved ? 'Đã lưu' : 'Lưu'}</Text>
                  </TouchableOpacity>
                </View>
              );
            }) : (
              [20, 50, 100].map(val => (
                <View key={val} style={styles.voucherCard}>
                  <View style={styles.voucherLeft}><Text style={styles.voucherLabel}>Giảm</Text><Text style={styles.voucherAmount}>{val}k</Text></View>
                  <TouchableOpacity style={styles.voucherRight}><Text style={styles.voucherAction}>Lưu</Text></TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map(t => (
            <TouchableOpacity key={t.key} style={[styles.tab, activeTab === t.key && styles.activeTab]} onPress={() => setActiveTab(t.key)}>
              <Text style={[styles.tabText, activeTab === t.key && styles.activeTabText]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>{renderTabContent()}</View>
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Chat FAB */}
      <TouchableOpacity style={styles.chatFab} onPress={handleChat} activeOpacity={0.8}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  loadingText: { marginTop: 12, color: '#666' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText: { fontSize: 16, color: '#666', marginVertical: 20 },
  backBtn: { paddingHorizontal: 30, paddingVertical: 10, backgroundColor: '#F83758', borderRadius: 20 },
  backBtnText: { color: '#FFF', fontWeight: 'bold' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F83758', gap: 10 },
  headerIcon: { padding: 4 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', height: 36, borderRadius: 18, paddingHorizontal: 12, gap: 6 },
  searchText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  heroSection: { height: 130, position: 'relative', backgroundColor: '#333' },
  coverImage: { ...StyleSheet.absoluteFillObject, opacity: 0.6 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  shopMainInfo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, gap: 10 },
  logoContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  logo: { width: '100%', height: '100%' },
  logoPlaceholder: { fontSize: 22, fontWeight: 'bold', color: '#F83758' },
  nameContainer: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shopName: { fontSize: 17, fontWeight: 'bold', color: '#FFF' },
  onlineStatus: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  followButton: { paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, borderColor: '#FFF', borderRadius: 20 },
  followingButton: { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: 'transparent' },
  followButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  followingButtonText: { color: '#EEE' },
  statsRow: { flexDirection: 'row', position: 'absolute', bottom: 14, left: 16, right: 16, gap: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statValue: { fontSize: 13, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  statDivider: { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'center' },
  vouchersSection: { backgroundColor: '#FFF', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  vouchersScroll: { paddingHorizontal: 16, gap: 10 },
  voucherCard: { flexDirection: 'row', backgroundColor: '#FFF8F9', borderWidth: 1, borderColor: '#F83758', borderRadius: 6, height: 48, overflow: 'hidden' },
  voucherLeft: { paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F83758', borderStyle: 'dashed' },
  voucherLabel: { fontSize: 9, color: '#F83758' },
  voucherAmount: { fontSize: 14, fontWeight: 'bold', color: '#F83758' },
  voucherRight: { paddingHorizontal: 14, justifyContent: 'center', backgroundColor: '#F83758' },
  voucherAction: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#F83758',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#F83758',
    fontWeight: '700',
  },
  content: {
    padding: 10,
    minHeight: 300,
  },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  // Main tab
  mainTabContent: {},
  infoCard: { backgroundColor: '#FFF', borderRadius: 10, padding: 14, marginBottom: 12, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 13, color: '#555', flex: 1 },
  descCard: { backgroundColor: '#FFF', borderRadius: 10, padding: 14, marginBottom: 14 },
  descTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 6 },
  descText: { fontSize: 13, color: '#666', lineHeight: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 10, marginLeft: 2 },
  // Categories tab
  catContent: {},
  catChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0' },
  catChipActive: { backgroundColor: '#F83758', borderColor: '#F83758' },
  catChipText: { fontSize: 13, color: '#666', fontWeight: '500' },
  catChipTextActive: { color: '#FFF', fontWeight: '700' },
  chatFab: { position: 'absolute', right: 20, bottom: 30, width: 54, height: 54, borderRadius: 27, backgroundColor: '#F83758', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#F83758', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
});

export default ShopPage;
