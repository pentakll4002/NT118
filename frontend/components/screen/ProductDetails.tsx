import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, Dimensions, Platform, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import ProductCard from '../common/ProductCard';

const { width } = Dimensions.get('window');

const ProductDetails: React.FC = () => {
  // Dummy related products
  const relatedProducts = [
    {
      id: '1',
      name: 'Giày Sneaker Trắng Basic Đế Cao Phối Đồ Cực Xinh',
      description: '',
      price: '₫850.000',
      rating: 4.5,
      reviews: 'Đã bán 1.2k',
      image: require('../../assets/images/Group 34010.png'), // Fallback generic image
      imageHeight: 180,
    },
    {
      id: '2',
      name: 'Giày Chạy Bộ Nam Nữ Siêu Nhẹ Air Max 2024',
      description: '',
      price: '₫1.100.000',
      rating: 4.8,
      reviews: 'Đã bán 845',
      image: require('../../assets/images/Group 34010.png'), // Fallback generic image
      imageHeight: 180,
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#F83758" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-social-outline" size={24} color="#F83758" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="cart-outline" size={24} color="#F83758" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Main Image Carousel placeholder */}
        <View style={styles.imageGallery}>
          <View style={styles.mainImagePlaceholder}>
            {/* The red shoe image placeholder */}
            <Text style={{color: '#999'}}>Product Image (Red Sneaker)</Text>
          </View>
          {/* Pagination dots */}
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleRow}>
            <View style={styles.mallBadge}>
              <Text style={styles.mallText}>MALL</Text>
            </View>
            <Text style={styles.productTitle}>Giày Thể Thao Nam Nữ Sneaker Red Edition - Phiên Bản Giới Hạn Cao Cấp 2024</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>₫1.250.000</Text>
            <Text style={styles.oldPrice}>₫2.500.000</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-50%</Text>
            </View>
          </View>

          <View style={styles.ratingHeartRow}>
            <View style={styles.ratingLeft}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons key={i} name="star" size={14} color="#F83758" />
                ))}
              </View>
              <Text style={styles.ratingNumber}>4.8</Text>
              <Text style={styles.soldText}>Đã bán 2,4k</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="heart" size={24} color="#555" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Voucher Section */}
        <TouchableOpacity style={styles.rowSection}>
          <Text style={styles.rowLabel}>Voucher của Shop</Text>
          <View style={styles.voucherTagsContainer}>
            <View style={styles.voucherTag}>
              <Text style={styles.voucherTagText}>Giảm ₫20k</Text>
            </View>
            <View style={styles.voucherTag}>
              <Text style={styles.voucherTagText}>Giảm ₫50k</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Shipping Section */}
        <View style={[styles.rowSection, styles.shippingSection]}>
          <MaterialCommunityIcons name="truck-fast-outline" size={24} color="#008B74" style={styles.shippingIcon} />
          <View style={styles.shippingInfo}>
            <Text style={styles.shippingTitle}>Miễn phí vận chuyển</Text>
            <Text style={styles.shippingDesc}>Miễn phí vận chuyển cho đơn hàng trên ₫0</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Variation Section */}
        <View style={styles.variationSection}>
          <TouchableOpacity style={styles.variationHeader}>
            <Text style={styles.rowLabelPrimary}>Phân loại</Text>
            <View style={styles.variationRight}>
              <Text style={styles.selectedVariationText}>Đỏ, 42</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
          <View style={styles.variationButtonsRow}>
            <TouchableOpacity style={styles.variationButton}>
              <Text style={styles.variationButtonText}>Đỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.variationButton}>
              <Text style={styles.variationButtonText}>Xanh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.variationButton, styles.variationButtonSelected]}>
              <Text style={[styles.variationButtonText, styles.variationButtonTextSelected]}>Đen</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Shop Info */}
        <View style={styles.shopSection}>
          <View style={styles.shopAvatar}>
            <Text style={styles.shopAvatarInitials}>SL</Text>
          </View>
          <View style={styles.shopInfoCenter}>
            <Text style={styles.shopName}>ShopeeLite Premium Store</Text>
            <Text style={styles.shopOnlineStatus}>ONLINE 5 PHÚT TRƯỚC</Text>
            <View style={styles.shopStats}>
              <Text style={styles.shopStatText}><Text style={styles.shopStatHighlight}>158</Text> Sản phẩm</Text>
              <Text style={styles.shopStatText}><Text style={styles.shopStatHighlight}>4.9</Text> Đánh giá</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.viewShopButton}>
            <Text style={styles.viewShopText}>Xem Shop</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Product Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>CHI TIẾT SẢN PHẨM</Text>
          
          <View style={styles.detailDataRow}>
            <Text style={styles.detailDataLabel}>Danh mục</Text>
            <Text style={styles.detailDataValueLink}>ShopeeLite &gt; Giày Nam &gt; Sneaker</Text>
          </View>
          <View style={styles.detailDataRow}>
            <Text style={styles.detailDataLabel}>Thương hiệu</Text>
            <Text style={styles.detailDataValue}>No Brand</Text>
          </View>
          <View style={styles.detailDataRow}>
            <Text style={styles.detailDataLabel}>Chất liệu</Text>
            <Text style={styles.detailDataValue}>Da tổng hợp cao cấp, vải dệt mesh thoáng khí</Text>
          </View>

          <Text style={styles.detailDescriptionParagraph}>
            Giày Sneaker Red Edition là sự kết hợp hoàn hảo giữa phong cách thời trang hiện đại và sự thoải mái tối đa.
          </Text>
          <Text style={styles.detailDescriptionBullet}>
            • Đế cao su đúc nguyên khối, chống trơn trượt hiệu quả.
          </Text>
          <Text style={styles.detailDescriptionBullet}>
            • Lót giày êm ái, hỗ trợ vận động trong thời gian dài.
          </Text>
          <Text style={styles.detailDescriptionBullet}>
            • Thiết kế trẻ trung, dễ dàng phối đồ cho nhiều dịp khác nhau.
          </Text>

          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>Xem thêm</Text>
            <Ionicons name="chevron-down" size={16} color="#F83758" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Similar Products */}
        <View style={styles.similarProductsSection}>
          <View style={styles.similarHeader}>
            <Text style={styles.detailsTitle}>SẢN PHẨM TƯƠNG TỰ</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllTextRed}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.productsGrid}>
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod as any} />
            ))}
          </View>
        </View>

        {/* Bottom padding for floating bar */}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Bottom Floating Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarIconAction}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#555" />
          <Text style={styles.bottomBarIconText}>Chat ngay</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomBarVertDivider} />
        
        <TouchableOpacity style={styles.bottomBarIconAction}>
          <Ionicons name="cart-outline" size={22} color="#555" />
          <View style={styles.plusIconBadge}>
             <Text style={styles.plusIconText}>+</Text>
          </View>
          <Text style={styles.bottomBarIconText}>Thêm giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyNowButton}>
          <Text style={styles.buyNowText}>MUA NGAY</Text>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F83758',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  imageGallery: {
    width: width,
    height: width * 0.8, // 4:3 roughly
    position: 'relative',
    backgroundColor: '#404040',
  },
  mainImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBEBEB',
  },
  pagination: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D1D1',
  },
  activeDot: {
    backgroundColor: '#F83758',
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mallBadge: {
    backgroundColor: '#F83758',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    marginRight: 8,
    marginTop: 2,
  },
  mallText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F83758',
  },
  oldPrice: {
    fontSize: 14,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FFF0F1',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  discountText: {
    color: '#F83758',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingHeartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingNumber: {
    fontSize: 12,
    color: '#333333',
    marginRight: 4,
  },
  soldText: {
    fontSize: 12,
    color: '#777777',
    borderLeftWidth: 1,
    borderLeftColor: '#EEEEEE',
    paddingLeft: 6,
  },
  divider: {
    height: 8,
    backgroundColor: '#F6F6F6',
  },
  rowSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  rowLabel: {
    fontSize: 12,
    color: '#555555',
    marginRight: 16,
  },
  voucherTagsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  voucherTag: {
    borderWidth: 1,
    borderColor: '#FFD3D6',
    backgroundColor: '#FFF8F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  voucherTagText: {
    color: '#F83758',
    fontSize: 10,
  },
  shippingSection: {
    alignItems: 'flex-start',
  },
  shippingIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  shippingInfo: {
    flex: 1,
  },
  shippingTitle: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    marginBottom: 4,
  },
  shippingDesc: {
    fontSize: 12,
    color: '#777777',
  },
  variationSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  variationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rowLabelPrimary: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  variationRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedVariationText: {
    fontSize: 13,
    color: '#777777',
    marginRight: 8,
  },
  variationButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  variationButton: {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  variationButtonSelected: {
    borderColor: '#F83758',
    backgroundColor: '#FFF0F1',
  },
  variationButtonText: {
    fontSize: 12,
    color: '#333333',
  },
  variationButtonTextSelected: {
    color: '#F83758',
    fontWeight: '500',
  },
  shopSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  shopAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shopAvatarInitials: {
    color: '#999',
    fontWeight: 'bold',
    fontSize: 16,
  },
  shopInfoCenter: {
    flex: 1,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  shopOnlineStatus: {
    fontSize: 10,
    color: '#008B74',
    marginBottom: 6,
  },
  shopStats: {
    flexDirection: 'row',
    gap: 12,
  },
  shopStatText: {
    fontSize: 11,
    color: '#777777',
  },
  shopStatHighlight: {
    color: '#F83758',
    fontWeight: '600',
  },
  viewShopButton: {
    borderWidth: 1,
    borderColor: '#F83758',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  viewShopText: {
    color: '#F83758',
    fontSize: 12,
    fontWeight: '500',
  },
  detailsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  detailDataRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailDataLabel: {
    width: 100,
    fontSize: 13,
    color: '#888888',
  },
  detailDataValue: {
    flex: 1,
    fontSize: 13,
    color: '#333333',
  },
  detailDataValueLink: {
    flex: 1,
    fontSize: 13,
    color: '#008B74',
  },
  detailDescriptionParagraph: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  detailDescriptionBullet: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 20,
    marginBottom: 4,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 4,
  },
  viewMoreText: {
    color: '#F83758',
    fontSize: 13,
    fontWeight: '500',
  },
  similarProductsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  similarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  viewAllTextRed: {
    color: '#F83758',
    fontSize: 13,
    fontWeight: '500',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomBarIconAction: {
    flex: 1,
    maxWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bottomBarVertDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#EEEEEE',
    alignSelf: 'center',
  },
  plusIconBadge: {
    position: 'absolute',
    top: 6,
    right: 12,
    backgroundColor: '#FFFFFF', // To punch through lines
    borderRadius: 8,
  },
  plusIconText: {
    fontSize: 12,
    color: '#F83758',
    fontWeight: 'bold',
  },
  bottomBarIconText: {
    fontSize: 10,
    color: '#555555',
    marginTop: 2,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#F83758',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProductDetails;
