import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProductById, ProductDTO, formatPriceFull } from '../../lib/productApi';
import { toggleFavorite, getFavoriteStatus } from '../../lib/wishlistApi';
import { useRouter, Link } from 'expo-router';

// Components
import ShopVoucherModal from '../common/ShopVoucherModal';

interface PlaceOrderProps {
  productId?: number;
  quantity?: number;
  variantId?: number;
}

const PlaceOrder: React.FC<PlaceOrderProps> = ({ productId = 1, quantity = 1, variantId }) => {
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [qty, setQty] = useState(quantity);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const selectedVariant = product?.variants?.find(v => v.id === variantId);
  const router = useRouter();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(productId);
      setProduct(data);
      try {
        const favStatus = await getFavoriteStatus(productId);
        setIsFavorited(favStatus);
      } catch { /* not logged in */ }
    } catch (err) {
      console.log('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const result = await toggleFavorite(productId);
      setIsFavorited(result.isFavorited);
    } catch (err) {
      console.log('Toggle fav failed:', err);
    }
  };

  const discountAmount = selectedVoucher ? (selectedVoucher.discountValue || 0) : 0;
  const unitPrice = product ? (product.price + (selectedVariant?.priceModifier || 0)) : 0;
  const orderAmount = unitPrice * qty;
  const deliveryFee = 0;
  const totalAmount = Math.max(0, orderAmount + deliveryFee - discountAmount);

  // Delivery estimate: ~5 days from now
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryStr = deliveryDate.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#F83758" />
        <Text style={{ marginTop: 12, color: '#666' }}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh Toán</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleToggleFavorite}>
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorited ? '#F83758' : '#000'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Component */}
        <View style={styles.productContainer}>
          <View style={styles.productImageWrapper}>
            {product?.image || (product?.thumbnails && product.thumbnails.length > 0) ? (
              <Image 
                source={{ uri: product.image || product.thumbnails![0] }} 
                style={styles.productImageFull} 
                resizeMode="cover" 
              />
            ) : (
              <Image source={require('../../assets/images/product/product-1.png')} style={styles.productImageFull} resizeMode="cover" />
            )}
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {product?.name || 'Sản phẩm'}
            </Text>
            <Text style={styles.productSubtitle} numberOfLines={1}>
              {product?.brand || product?.description?.slice(0, 40) || ''}
            </Text>

            {selectedVariant && (
              <View style={styles.variantBadge}>
                <Text style={styles.variantBadgeText}>
                  {selectedVariant.name}: {selectedVariant.value}
                </Text>
              </View>
            )}

            <View style={styles.dropdownsRow}>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={styles.qtyBtnSmall} 
                  onPress={() => setQty(Math.max(1, qty - 1))}
                >
                  <Ionicons name="remove" size={16} color="#333" />
                </TouchableOpacity>
                <Text style={styles.qtyTextSmall}>{qty}</Text>
                <TouchableOpacity 
                  style={styles.qtyBtnSmall} 
                  onPress={() => setQty(qty + 1)}
                >
                  <Ionicons name="add" size={16} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Giao hàng dự kiến </Text>
              <Text style={styles.deliveryValue}>{deliveryStr}</Text>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Coupon Section */}
        <View style={styles.couponContainer}>
          <View style={styles.couponLeft}>
            <Ionicons name="pricetag-outline" size={22} color="#F83758" />
            <Text style={styles.couponText}>  {selectedVoucher ? selectedVoucher.code : 'Mã giảm giá'}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowVoucherModal(true)}>
            <Text style={styles.selectText}>{selectedVoucher ? 'Thay đổi' : 'Chọn'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        {/* Order Details Header */}
        <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>

        {/* Order Details Values */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tạm tính</Text>
            <Text style={styles.detailValue}>{formatPriceFull(orderAmount)}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giảm giá</Text>
              <Text style={styles.actionText}>-{formatPriceFull(discountAmount)}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phí vận chuyển</Text>
            <Text style={styles.actionText}>{deliveryFee === 0 ? 'Miễn phí' : formatPriceFull(deliveryFee)}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Total Order Section */}
        <View style={styles.totalSection}>
          <View style={styles.detailRow}>
            <Text style={styles.totalTitle}>Tổng đơn hàng</Text>
            <Text style={styles.totalValue}>{formatPriceFull(totalAmount)}</Text>
          </View>
        </View>

        {/* Extra spacing for scroll padding */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Floating Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomTotalValue}>{formatPriceFull(totalAmount)}</Text>
          <TouchableOpacity>
            <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
        <Link href={{ pathname: '/payment', params: { productId, quantity: qty, variantId } }} asChild>
          <TouchableOpacity style={styles.checkoutButton} activeOpacity={0.8}>
            <Text style={styles.checkoutButtonText}>Tiến hành thanh toán</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <ShopVoucherModal 
        visible={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        shopId={product?.shopId}
        mode="select"
        onSelectVoucher={(v) => {
          setSelectedVoucher(v);
          setShowVoucherModal(false);
        }}
        selectedVoucherId={selectedVoucher?.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  productContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 24,
  },
  productImageWrapper: {
    width: 100,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  productImageFull: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 12,
    lineHeight: 18,
  },
  dropdownsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  dropdownText: {
    fontSize: 12,
    color: '#333333',
  },
  dropdownBold: {
    fontWeight: '600',
    color: '#000000',
  },
  deliveryRow: {
    flexDirection: 'row',
  },
  deliveryLabel: {
    fontSize: 12,
    color: '#555555',
  },
  deliveryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 20,
  },
  couponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponText: {
    fontSize: 16,
    color: '#000000',
  },
  selectText: {
    fontSize: 14,
    color: '#F83758',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#333333',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  actionText: {
    fontSize: 14,
    color: '#F83758',
    fontWeight: '500',
  },
  totalSection: {},
  totalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    borderColor: '#EEEEEE',
    borderTopWidth: 1,
  },
  bottomBarLeft: {
    flexDirection: 'column',
  },
  bottomTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#F83758',
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: '#F83758',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  qtyBtnSmall: {
    padding: 8,
  },
  qtyTextSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },
  variantBadge: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  variantBadgeText: {
    fontSize: 11,
    color: '#F83758',
    fontWeight: '600',
  },
});

export default PlaceOrder;
