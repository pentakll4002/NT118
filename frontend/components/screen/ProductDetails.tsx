import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, Dimensions, Platform, StatusBar, ActivityIndicator, FlatList, Alert, Modal, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import ProductCard, { Product } from '../common/ProductCard';
import { getProductById, getProducts, ProductDTO, formatPriceFull, formatSold } from '../../lib/productApi';
import { toggleFavorite, getFavoriteStatus } from '../../lib/wishlistApi';
import { getProductReviews, ReviewDto } from '../../lib/reviewApi';
import { ShopDTO } from '../../lib/mockData';
import { getShopById } from '../../lib/shopApi';
import { addToCart } from '../../lib/cartApi';
import { getMyOrders, getOrderDetail } from '../../lib/orderApi';
import { useRouter } from 'expo-router';
import ShopVoucherModal from '../common/ShopVoucherModal';

const { width } = Dimensions.get('window');

interface ProductDetailsProps {
  productId?: number;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ productId = 1 }) => {
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [shop, setShop] = useState<ShopDTO | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<number | 'all'>('all');
  const [deliveredOrderId, setDeliveredOrderId] = useState<number | null>(null);
  
  // Selection Modal states
  const [isSelectionModalVisible, setIsSelectionModalVisible] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({}); // { "Màu sắc": "Đỏ", "Kích cỡ": "42" }
  const [modalMode, setModalMode] = useState<'cart' | 'buy'>('cart');
  const [showShopVoucherModal, setShowShopVoucherModal] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(productId);
      setProduct(data);

      // Load shop details
      try {
        const shopData = await getShopById(data.shopId);
        setShop(shopData);
      } catch (err) { console.log('Failed to load shop:', err); }

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

      // Load reviews
      try {
        setReviewsLoading(true);
        const reviewResponse = await getProductReviews(productId, 1, 10);
        setReviews(reviewResponse.reviews);
      } catch (err) {
        console.log('Failed to load reviews:', err);
      } finally {
        setReviewsLoading(false);
      }

      // Check if user has a delivered order containing this product
      try {
        const myOrders = await getMyOrders();
        const deliveredOrders = myOrders.filter(o => o.status === 'delivered');
        for (const o of deliveredOrders) {
          try {
            const detail = await getOrderDetail(o.id);
            if (detail.items.some(item => item.productId === productId)) {
              setDeliveredOrderId(o.id);
              break;
            }
          } catch { /* skip */ }
        }
      } catch { /* user not logged in or no orders */ }
    } catch (err) {
      console.log('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviewFilter === 'all' 
    ? reviews 
    : reviews.filter(r => Math.floor(r.rating) === reviewFilter);

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

      {/* Image Lightbox */}
      <Modal visible={isLightboxVisible} transparent={true} animationType="fade">
        <View style={styles.lightboxBg}>
          <TouchableOpacity style={styles.closeLightbox} onPress={() => setIsLightboxVisible(false)}>
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
          <Image 
            source={{ uri: thumbnails[activeImageIdx] }} 
            style={styles.lightboxImage} 
            resizeMode="contain" 
          />
        </View>
      </Modal>

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
        <TouchableOpacity style={styles.rowSection} onPress={() => setShowShopVoucherModal(true)}>
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
            {shop?.logoUrl ? (
              <Image source={{ uri: shop.logoUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.shopAvatarInitials}>{shop?.name?.[0] || 'S'}</Text>
            )}
          </View>
          <View style={styles.shopInfoCenter}>
            <Text style={styles.shopName}>{shop?.name || 'Đang tải...'}</Text>
            <Text style={styles.shopOnlineStatus}>ONLINE 5 PHÚT TRƯỚC</Text>
            <View style={styles.shopStats}>
              <Text style={styles.shopStatText}><Text style={styles.shopStatHighlight}>{shop?.totalProducts || 0}</Text> Sản phẩm</Text>
              <Text style={styles.shopStatText}><Text style={styles.shopStatHighlight}>{shop?.rating || 0}</Text> Đánh giá</Text>
              <Text style={styles.shopStatText}><Text style={styles.shopStatHighlight}>{(shop as any)?.followerCount || 0}</Text> Theo dõi</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.viewShopButton}
            onPress={() => router.push(`/shop/${product.shopId}` as any)}
          >
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

        {/* Ratings & Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.detailsTitle}>ĐÁNH GIÁ SẢN PHẨM</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.viewAllTextRed}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
            {['Tất cả', '5 sao', '4 sao', '3 sao', '2 sao', '1 sao'].map((label, idx) => {
              const val = idx === 0 ? 'all' : 6 - idx;
              const isActive = reviewFilter === val;
              return (
                <TouchableOpacity 
                  key={label} 
                  style={[styles.filterChip, isActive && styles.activeFilterChip]}
                  onPress={() => setReviewFilter(val as any)}
                >
                  <Text style={[styles.filterChipText, isActive && styles.activeFilterChipText]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.ratingSummary}>
            <View style={styles.ratingBig}>
              <Text style={styles.ratingBigText}>{product.rating.toFixed(1)}</Text>
              <Text style={styles.ratingMaxText}>/5</Text>
            </View>
            <View style={styles.ratingStarsCol}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons
                    key={i}
                    name={i <= Math.floor(product.rating) ? "star" : i - 0.5 <= product.rating ? "star-half" : "star-outline"}
                    size={16}
                    color={i <= product.rating + 0.5 ? "#F83758" : "#CCCCCC"}
                  />
                ))}
              </View>
              <Text style={styles.totalReviewsText}>{product.totalReviews} đánh giá</Text>
            </View>
            {deliveredOrderId ? (
              <TouchableOpacity 
                style={styles.writeReviewButton}
                onPress={() => router.push({ pathname: '/write-review', params: { productId, orderId: deliveredOrderId } })}
              >
                <Feather name="edit-3" size={16} color="#F83758" />
                <Text style={styles.writeReviewText}>Viết đánh giá</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.writeReviewButton, { opacity: 0.4 }]}>
                <Feather name="edit-3" size={16} color="#999" />
                <Text style={[styles.writeReviewText, { color: '#999' }]}>Mua để đánh giá</Text>
              </View>
            )}
          </View>

          {reviewsLoading ? (
            <ActivityIndicator size="small" color="#F83758" style={{ marginVertical: 10 }} />
          ) : filteredReviews.length > 0 ? (
            <View style={styles.reviewList}>
              {filteredReviews.map((item) => (
                <View key={item.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerAvatar}>
                      {item.reviewerAvatar ? (
                        <Image source={{ uri: item.reviewerAvatar }} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
                      ) : (
                        <Text style={styles.avatarText}>{item.reviewerName[0]}</Text>
                      )}
                    </View>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{item.reviewerName}</Text>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Ionicons
                            key={i}
                            name={i <= item.rating ? "star" : "star-outline"}
                            size={12}
                            color={i <= item.rating ? "#F83758" : "#CCCCCC"}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  {item.comment && (
                    <Text style={styles.reviewComment}>{item.comment}</Text>
                  )}
                  {item.isVerified && (
                    <View style={styles.verifiedRow}>
                      <Ionicons name="checkmark-circle" size={12} color="#008B74" />
                      <Text style={styles.verifiedText}>Đã mua hàng</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noReviewsText}>Chưa có đánh giá nào cho sản phẩm này.</Text>
          )}
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

      {/* Variation Selection Modal */}
      <Modal
        visible={isSelectionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSelectionModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsSelectionModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Header: Product Info Preview */}
            <View style={styles.modalHeader}>
              <Image source={{ uri: product.image || '' }} style={styles.modalProductImage} />
              <View style={styles.modalHeaderInfo}>
                <TouchableOpacity 
                  style={styles.closeModalBtn} 
                  onPress={() => setIsSelectionModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#999" />
                </TouchableOpacity>
                <Text style={styles.modalPrice}>{formatPriceFull(product.price)}</Text>
                <Text style={styles.modalStock}>Kho: {product.stockQuantity}</Text>
              </View>
            </View>

            <ScrollView style={styles.selectionScroll} showsVerticalScrollIndicator={false}>
              {/* Variants Section */}
              {product.variants && product.variants.length > 0 && (
                Object.entries(
                  product.variants.reduce((acc, curr) => {
                    if (!acc[curr.name]) acc[curr.name] = [];
                    acc[curr.name].push(curr.value);
                    return acc;
                  }, {} as Record<string, string[]>)
                ).map(([name, values]) => (
                  <View key={name} style={styles.variantSection}>
                    <Text style={styles.variantLabel}>{name}</Text>
                    <View style={styles.chipsContainer}>
                      {values.map(val => (
                        <TouchableOpacity 
                          key={val} 
                          style={[
                            styles.variantChip, 
                            selectedVariants[name] === val && styles.activeVariantChip
                          ]}
                          onPress={() => setSelectedVariants(prev => ({ ...prev, [name]: val }))}
                        >
                          <Text style={[
                            styles.variantChipText,
                            selectedVariants[name] === val && styles.activeVariantChipText
                          ]}>{val}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))
              )}

              {/* Quantity Section */}
              <View style={styles.quantitySection}>
                <Text style={styles.variantLabel}>Số lượng</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                  >
                    <Ionicons name="remove" size={20} color="#555" />
                  </TouchableOpacity>
                  <View style={styles.qtyInput}>
                    <Text style={styles.qtyText}>{selectedQuantity}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => setSelectedQuantity(Math.min(product.stockQuantity, selectedQuantity + 1))}
                  >
                    <Ionicons name="add" size={20} color="#555" />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Final Action Button */}
            <TouchableOpacity 
              style={styles.confirmBtn}
              onPress={async () => {
                // Check if all variants are selected (if product has variants)
                const variantNames = [...new Set(product.variants?.map(v => v.name) || [])];
                if (variantNames.some(name => !selectedVariants[name])) {
                  Alert.alert('Thông báo', 'Vui lòng chọn đầy đủ phân loại sản phẩm.');
                  return;
                }

                let variantId: number | undefined;
                if (product.variants && product.variants.length > 0) {
                  const firstKey = Object.keys(selectedVariants)[0];
                  variantId = product.variants.find(v => v.name === firstKey && v.value === selectedVariants[firstKey])?.id;
                }

                setIsSelectionModalVisible(false);
                setAddingToCart(true);
                try {
                  const result = await addToCart(productId, selectedQuantity, variantId);
                  if (result.success) {
                    if (modalMode === 'buy') {
                       router.push('/(tabs)/cart');
                    } else {
                      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng.');
                    }
                  } else {
                    Alert.alert('Lỗi', result.message);
                  }
                } catch (err) {
                  Alert.alert('Lỗi', 'Không thể thực hiện tác vụ.');
                } finally {
                  setAddingToCart(false);
                }
              }}
            >
              <Text style={styles.confirmBtnText}>Xác nhận</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom Floating Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.bottomBarIconAction} 
          onPress={() => {
            if (shop?.ownerId) {
              router.push({
                pathname: '/chat/[id]',
                params: { id: shop.ownerId.toString(), name: shop.name }
              } as any);
            } else {
              router.push('/chat');
            }
          }}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#555" />
          <Text style={styles.bottomBarIconText}>Chat ngay</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomBarVertDivider} />
        
        <TouchableOpacity 
          style={styles.bottomBarIconAction} 
          onPress={() => {
            setModalMode('cart');
            setIsSelectionModalVisible(true);
          }}
        >
          <Ionicons name="cart-outline" size={22} color="#555" />
          <View style={styles.plusIconBadge}>
             <Text style={styles.plusIconText}>+</Text>
          </View>
          <Text style={styles.bottomBarIconText}>Thêm giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buyNowButton} 
          onPress={() => {
            setModalMode('buy');
            setIsSelectionModalVisible(true);
          }}
        >
          <Text style={styles.buyNowText}>MUA NGAY</Text>
        </TouchableOpacity>
      </View>

      {/* Shop Voucher Modal */}
      <ShopVoucherModal 
        visible={showShopVoucherModal} 
        onClose={() => setShowShopVoucherModal(false)}
        shopId={product?.shopId}
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
    paddingBottom: 12,
  },
  shopRow: { flexDirection: 'row', alignItems: 'center' },
  shopInfo: { flex: 1, marginLeft: 12 },
  shopNameText: { fontSize: 16, fontWeight: '600', color: '#333' },
  shopActiveText: { fontSize: 12, color: '#888', marginTop: 4 },
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
    backgroundColor: '#F1F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  shopAvatarInitials: {
    color: '#999',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFF8F9',
    padding: 12,
    borderRadius: 8,
  },
  ratingBig: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 16,
  },
  ratingBigText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F83758',
  },
  ratingMaxText: {
    fontSize: 14,
    color: '#999',
  },
  ratingStarsCol: {
    flex: 1,
  },
  totalReviewsText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F83758',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  writeReviewText: {
    color: '#F83758',
    fontSize: 12,
    fontWeight: '500',
  },
  reviewList: {
    marginTop: 0,
  },
  reviewItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#F83758',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
  },
  reviewComment: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
    marginBottom: 8,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: '#008B74',
  },
  noReviewsText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
    fontSize: 14,
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
    backgroundColor: '#FFFFFF', 
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalProductImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: -40,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  modalHeaderInfo: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    padding: 4,
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F83758',
  },
  modalStock: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  selectionScroll: {
    maxHeight: 400,
    padding: 16,
  },
  variantSection: {
    marginBottom: 20,
  },
  variantLabel: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  variantChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeVariantChip: {
    backgroundColor: '#FFF8F9',
    borderColor: '#F83758',
  },
  variantChipText: {
    fontSize: 13,
    color: '#555',
  },
  activeVariantChipText: {
    color: '#F83758',
    fontWeight: '500',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
  },
  qtyBtn: {
    padding: 8,
    backgroundColor: '#F9F9F9',
  },
  qtyInput: {
    width: 40,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#CCC',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmBtn: {
    backgroundColor: '#F83758',
    margin: 16,
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  activeFilterChip: {
    backgroundColor: '#FFF0F3',
    borderColor: '#F83758',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterChipText: {
    color: '#F83758',
    fontWeight: '600',
  },
  lightboxBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeLightbox: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  lightboxImage: {
    width: '100%',
    height: '80%',
  },
});

export default ProductDetails;
