import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useFocusEffect } from 'expo-router';

// APIs
import { getProductById, getProducts, ProductDTO, formatPriceFull, formatSold } from '../../lib/productApi';
import { getCategories } from '../../lib/categoryApi';
import { toggleFavorite, getFavoriteStatus } from '../../lib/wishlistApi';
import { getProductReviews, ReviewDto } from '../../lib/reviewApi';
import { ShopDTO, getShopById } from '../../lib/shopApi';
import { addToCart } from '../../lib/cartApi';
import { getMyOrders, getOrderDetail } from '../../lib/orderApi';

// Components
import ProductCard, { Product } from '../common/ProductCard';
import ShopVoucherModal from '../common/ShopVoucherModal';
import VoiceAssistantModal from '../common/VoiceAssistantModal';
import Skeleton from '../common/Skeleton';

// Sub-components
import ProductHeader from '../product-details/ProductHeader';
import ProductImageGallery from '../product-details/ProductImageGallery';
import ProductMainInfo from '../product-details/ProductMainInfo';
import ProductPerks from '../product-details/ProductPerks';
import ProductSpecs from '../product-details/ProductSpecs';
import ProductShopInfo from '../product-details/ProductShopInfo';
import ProductDescription from '../product-details/ProductDescription';
import ProductReviews from '../product-details/ProductReviews';
import ProductBottomBar from '../product-details/ProductBottomBar';
import ProductSelectionModal from '../product-details/ProductSelectionModal';

interface ProductDetailsProps {
  productId?: number;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ productId = 1 }) => {
  const router = useRouter();

  // State
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [shop, setShop] = useState<ShopDTO | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [categoryName, setCategoryName] = useState<string>('');
  const [deliveredOrderId, setDeliveredOrderId] = useState<number | null>(null);

  // Modal states
  const [isSelectionModalVisible, setIsSelectionModalVisible] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'cart' | 'buy'>('cart');
  const [showShopVoucherModal, setShowShopVoucherModal] = useState(false);
  const [isVoiceVisible, setIsVoiceVisible] = useState(false);

  // Refresh data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProduct();
    }, [productId])
  );

  const loadProduct = async () => {
    try {
      if (!product) setLoading(true); // Only show skeleton on first load
      const data = await getProductById(productId);
      setProduct(data);

      const [shopData, favStatus, cats, related, reviewResponse, count] = await Promise.all([
        getShopById(data.shopId).catch(() => null),
        getFavoriteStatus(productId).catch(() => false),
        getCategories().catch(() => []),
        getProducts({ categoryId: data.categoryId, pageSize: 4 }).catch(() => ({ data: [] })),
        getProductReviews(productId, 1, 10).catch(() => ({ reviews: [] })),
        import('../../lib/cartApi').then(m => m.getCartCount()).catch(() => 0),
      ]);

      if (shopData) setShop(shopData);
      setIsFavorited(favStatus);
      const cat = cats.find((c: any) => c.id === data.categoryId);
      if (cat) setCategoryName(cat.name);

      setRelatedProducts(
        (related as any).data
          .filter((p: any) => p.id !== data.id)
          .slice(0, 4)
          .map((dto: any) => ({
            id: dto.id,
            name: dto.name,
            description: dto.description || '',
            price: formatPriceFull(dto.price),
            originalPrice: dto.originalPrice ? formatPriceFull(dto.originalPrice) : undefined,
            discount: dto.discount > 0 ? `${dto.discount}% Off` : undefined,
            rating: dto.rating,
            reviews: formatSold(dto.soldQuantity),
            image: dto.image ? { uri: dto.image } : require('../../assets/images/product/product-1.png'),
            imageHeight: 180,
          }))
      );

      setReviews((reviewResponse as any).reviews || []);
      setCartCount(count as number);

      // Check for delivered orders for review capability
      try {
        const myOrders = await getMyOrders();
        const deliveredOrders = myOrders.filter(o => o.status === 'delivered');
        for (const o of deliveredOrders) {
          const detail = await getOrderDetail(o.id);
          if (detail.items.some(item => item.productId === productId)) {
            setDeliveredOrderId(o.id);
            break;
          }
        }
      } catch { /* skip */ }

    } catch (err) {
      console.log('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      setFavLoading(true);
      const res = await toggleFavorite(productId);
      setIsFavorited(res.isFavorited);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thực hiện tính năng này');
    } finally {
      setFavLoading(false);
    }
  };

  const handleAddToCart = () => {
    setModalMode('cart');
    setIsSelectionModalVisible(true);
  };

  const handleBuyNow = () => {
    setModalMode('buy');
    setIsSelectionModalVisible(true);
  };

  const handleConfirmSelection = async () => {
    if (modalMode === 'cart') {
      try {
        setAddingToCart(true);
        await addToCart(productId, selectedQuantity, selectedVariantId);
        setIsSelectionModalVisible(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
        const count = await import('../../lib/cartApi').then(m => m.getCartCount());
        setCartCount(count);
      } catch (err: any) {
        Alert.alert('Lỗi', err.message || 'Không thể thêm vào giỏ hàng');
      } finally {
        setAddingToCart(false);
      }
    } else {
      setIsSelectionModalVisible(false);
      router.push({
        pathname: '/placeorder',
        params: { productId, quantity: selectedQuantity, variantId: selectedVariantId }
      });
    }
  };

  if (loading) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Skeleton width="100%" height="100%" /></View>;
  if (!product) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Sản phẩm không tồn tại.</Text></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProductHeader 
        productName={product.name} 
        productPrice={product.price} 
        cartCount={cartCount} 
        onVoicePress={() => setIsVoiceVisible(true)}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ProductImageGallery 
          images={product.thumbnails?.length > 0 ? product.thumbnails : (product.image ? [product.image] : [])} 
          activeIndex={activeImageIdx}
          onScroll={setActiveImageIdx}
          onImagePress={() => {}} 
        />

        <ProductMainInfo 
          name={product.name}
          price={product.price}
          originalPrice={product.originalPrice || undefined}
          discount={product.discount}
          rating={product.rating}
          soldCount={product.soldQuantity}
          isFavorited={isFavorited}
          onToggleFavorite={handleToggleFavorite}
          favLoading={favLoading}
        />

        <ProductPerks />

        <ProductSpecs 
          categoryName={categoryName}
          brandName={product.brand || undefined}
          stockQuantity={product.stockQuantity}
        />

        <ProductShopInfo shop={shop} />

        <ProductDescription description={product.description} />

        <ProductReviews 
          productId={productId}
          rating={product.rating} 
          reviews={reviews}
          canReview={!!deliveredOrderId}
          onWriteReview={() => router.push({ pathname: '/write-review', params: { productId, orderId: deliveredOrderId } })}
        />

        {/* Similar Products */}
        <View style={styles.similarSection}>
          <Text style={styles.sectionTitle}>Sản phẩm tương tự</Text>
          <View style={styles.productsGrid}>
            {relatedProducts.map(p => (
              <View key={p.id} style={{ width: '48%', marginBottom: 16 }}>
                <ProductCard product={p} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <ProductBottomBar 
        onChat={() => {}} 
        onAddToCart={handleAddToCart} 
        onBuyNow={handleBuyNow} 
      />

      <ProductSelectionModal 
        visible={isSelectionModalVisible}
        onClose={() => setIsSelectionModalVisible(false)}
        product={product}
        selectedQuantity={selectedQuantity}
        setSelectedQuantity={setSelectedQuantity}
        selectedVariantId={selectedVariantId}
        onSelectVariant={setSelectedVariantId}
        mode={modalMode}
        onConfirm={handleConfirmSelection}
        loading={addingToCart}
      />

      <ShopVoucherModal 
        visible={showShopVoucherModal}
        onClose={() => setShowShopVoucherModal(false)}
        shopId={product.shopId}
      />

      <VoiceAssistantModal 
        visible={isVoiceVisible} 
        onClose={() => setIsVoiceVisible(false)} 
        currentProductId={productId}
        onAddToCart={async () => handleAddToCart()}
        onAddToWishlist={async () => handleToggleFavorite()}
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
  scrollContent: {
    paddingBottom: 100,
  },
  similarSection: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 8,
    borderTopColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default ProductDetails;
