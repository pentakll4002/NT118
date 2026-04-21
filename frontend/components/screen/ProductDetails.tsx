import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, Dimensions, Platform, StatusBar, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import ProductCard, { Product } from '../common/ProductCard';
import { getProductById, getProducts, ProductDTO, formatPriceFull, formatSold } from '../../lib/productApi';
import { toggleFavorite, getFavoriteStatus } from '../../lib/wishlistApi';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface ProductDetailsProps {
  productId?: number;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ productId = 1 }) => {
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(productId);
      setProduct(data);

      // Load favorite status
      try {
        const favStatus = await getFavoriteStatus(productId);
        setIsFavorited(favStatus);
      } catch { /* user not logged in */ }

      // Load related products from same category
      const related = await getProducts({ categoryId: data.categoryId, pageSize: 4 });
      setRelatedProducts(
        related.data
          .filter(p => p.id !== data.id)
          .slice(0, 4)
          .map(dto => ({
            id: dto.id,
            name: dto.name,
            description: dto.description || '',
            price: formatPriceFull(dto.price),
            originalPrice: dto.originalPrice ? formatPriceFull(dto.originalPrice) : undefined,
            discount: dto.discount > 0 ? `${dto.discount}% Off` : undefined,
            rating: dto.rating,
            reviews: formatSold(dto.soldQuantity),
            image: dto.image ? { uri: dto.image } : require('../../assets/images/Group 34010.png'),
            imageHeight: 180,
          }))
      );
    } catch (err) {
      console.log('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#F83758" />
        <Text style={{ marginTop: 12, color: '#666' }}>Đang tải sản phẩm...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#999" />
        <Text style={{ marginTop: 12, color: '#666' }}>Sản phẩm không tồn tại.</Text>
      </SafeAreaView>
    );
  }

  const discountPercent = product.discount > 0 ? `-${product.discount}%` : null;
  const thumbnails = product.thumbnails?.length > 0 ? product.thumbnails : (product.image ? [product.image] : []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F83758" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-social-outline" size={24} color="#F83758" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(tabs)/cart')}>
            <Ionicons name="cart-outline" size={24} color="#F83758" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Main Image Carousel */}
        <View style={styles.imageGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIdx(idx);
            }}
          >
            {thumbnails.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={{ width, height: width * 0.8 }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
          {/* Pagination dots */}
          <View style={styles.pagination}>
            {thumbnails.map((_, idx) => (
              <View key={idx} style={[styles.dot, activeImageIdx === idx && styles.activeDot]} />
            ))}
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleRow}>
            <View style={styles.mallBadge}>
              <Text style={styles.mallText}>MALL</Text>
            </View>
            <Text style={styles.productTitle}>{product.name}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>{formatPriceFull(product.price)}</Text>
            {product.originalPrice && (
              <Text style={styles.oldPrice}>{formatPriceFull(product.originalPrice)}</Text>
            )}
            {discountPercent && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discountPercent}</Text>
              </View>
            )}
          </View>

          <View style={styles.ratingHeartRow}>
            <View style={styles.ratingLeft}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons
                    key={i}
                    name={i <= Math.floor(product.rating) ? "star" : i - 0.5 <= product.rating ? "star-half" : "star-outline"}
                    size={14}
                    color={i <= product.rating + 0.5 ? "#F83758" : "#CCCCCC"}
                  />
                ))}
              </View>
              <Text style={styles.ratingNumber}>{product.rating.toFixed(1)}</Text>
              <Text style={styles.soldText}>{formatSold(product.soldQuantity)}</Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                if (favLoading) return;
                setFavLoading(true);
                try {
                  const result = await toggleFavorite(productId);
                  setIsFavorited(result.isFavorited);
                } catch (err) { console.log('Favorite toggle failed:', err); }
                finally { setFavLoading(false); }
              }}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorited ? '#F83758' : '#555'}
              />
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

        {/* Stock & Brand Info */}
        <View style={styles.variationSection}>
          {product.brand && (
            <View style={styles.variationHeader}>
              <Text style={styles.rowLabelPrimary}>Thương hiệu</Text>
              <Text style={styles.selectedVariationText}>{product.brand}</Text>
            </View>
          )}
          <View style={styles.variationHeader}>
            <Text style={styles.rowLabelPrimary}>Tồn kho</Text>
            <Text style={styles.selectedVariationText}>{product.stockQuantity} sản phẩm</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Shop Info */}
        <View style={styles.shopSection}>
          <View style={styles.shopAvatar}>
            <Text style={styles.shopAvatarInitials}>GV</Text>
          </View>
          <View style={styles.shopInfoCenter}>
            <Text style={styles.shopName}>GearVN Official</Text>
            <Text style={styles.shopOnlineStatus}>ONLINE 5 PHÚT TRƯỚC</Text>
            <View style={styles.shopStats}>
              <Text style={styles.shopStatText}><Text style={styles.shopStatHighlight}>3949</Text> Sản phẩm</Text>
              <Text style={styles.shopStatText}><Text style={styles.shopStatHighlight}>4.8</Text> Đánh giá</Text>
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
            <Text style={styles.detailDataValueLink}>ShopeeLite &gt; Công nghệ</Text>
          </View>
          {product.brand && (
            <View style={styles.detailDataRow}>
              <Text style={styles.detailDataLabel}>Thương hiệu</Text>
              <Text style={styles.detailDataValue}>{product.brand}</Text>
            </View>
          )}
          {product.dimensions && (
            <View style={styles.detailDataRow}>
              <Text style={styles.detailDataLabel}>Kích thước</Text>
              <Text style={styles.detailDataValue}>{product.dimensions} cm</Text>
            </View>
          )}
          {product.weightGrams && (
            <View style={styles.detailDataRow}>
              <Text style={styles.detailDataLabel}>Trọng lượng</Text>
              <Text style={styles.detailDataValue}>{product.weightGrams}g</Text>
            </View>
          )}

          {product.description ? (
            <Text style={styles.detailDescriptionParagraph}>{product.description}</Text>
          ) : null}

          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>Xem thêm</Text>
            <Ionicons name="chevron-down" size={16} color="#F83758" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Similar Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.similarProductsSection}>
            <View style={styles.similarHeader}>
              <Text style={styles.detailsTitle}>SẢN PHẨM TƯƠNG TỰ</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllTextRed}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.productsGrid}>
              {relatedProducts.map((prod) => (
                <ProductCard 
                  key={prod.id} 
                  product={prod as any} 
                  onPress={(p) => router.push(`/product/${p.id}` as any)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Bottom padding for floating bar */}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Bottom Floating Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarIconAction} onPress={() => router.push('/chat')}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#555" />
          <Text style={styles.bottomBarIconText}>Chat ngay</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomBarVertDivider} />
        
        <TouchableOpacity style={styles.bottomBarIconAction} onPress={() => router.push('/(tabs)/cart')}>
          <Ionicons name="cart-outline" size={22} color="#555" />
          <View style={styles.plusIconBadge}>
             <Text style={styles.plusIconText}>+</Text>
          </View>
          <Text style={styles.bottomBarIconText}>Thêm giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buyNowButton}
          onPress={() => router.push({ pathname: '/placeorder', params: { productId } })}
        >
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
    height: width * 0.8,
    position: 'relative',
    backgroundColor: '#FFFFFF',
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
  selectedVariationText: {
    fontSize: 13,
    color: '#777777',
    marginRight: 8,
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
