import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CartBottomBar from '../../features/Cart/CartBottomBar';
import CartSection from '../../features/Cart/CartSection';
import CartShippingProgress from '../../features/Cart/CartShippingProgress';
import useCartScreen from '../../features/Cart/useCartScreen';
import ProductCard from '../common/ProductCard';
import VoucherSelectorRow from '../../features/Cart/VoucherSelectorRow';
import PlatformVoucherModal from '../../features/Cart/PlatformVoucherModal';
import ShopVoucherModal from '../common/ShopVoucherModal';

const { width } = Dimensions.get('window');

export default function CartScreen() {
  const router = useRouter();
  const {
    sections,
    summary,
    recommendedProducts,
    handleToggleShop,
    handleToggleItem,
    handleIncreaseItem,
    handleDecreaseItem,
    handleToggleAll,
    handlePressVoucher,
    handlePressProduct,
    handlePressItem,
    handleCheckout,
    handleDeleteShop,
    handleDeleteItem,
  } = useCartScreen();

  const isEmpty = sections.length === 0;
  const [showVoucherModal, setShowVoucherModal] = React.useState(false);
  const [selectedPlatformVouchers, setSelectedPlatformVouchers] = React.useState<any[]>([]);
  const [selectedShopVouchers, setSelectedShopVouchers] = React.useState<Record<string, any>>({});
  const [activeShopVoucherShopId, setActiveShopVoucherShopId] = React.useState<string | null>(null);

  const isFreeship = (v: any) => (v.code && v.code.includes('FREESHIP')) || (v.name && v.name.toLowerCase().includes('miễn phí'));

  let finalPrice = summary.totalPrice;
  
  // Apply platform vouchers
  if (selectedPlatformVouchers.length > 0) {
    selectedPlatformVouchers.forEach(voucher => {
      if (!isFreeship(voucher)) {
        if (voucher.discountType === 'Percentage') {
          let discount = finalPrice * (voucher.discountValue / 100);
          if (voucher.maxDiscount) {
            discount = Math.min(discount, voucher.maxDiscount);
          }
          finalPrice -= discount;
        } else {
          finalPrice -= voucher.discountValue;
        }
      }
    });
  }
  
  // Apply shop vouchers
  Object.values(selectedShopVouchers).forEach(sv => {
    if (sv) {
      if (sv.discountType === 'Percentage') {
        let discount = finalPrice * (sv.discountValue / 100);
        if (sv.maxDiscount) discount = Math.min(discount, sv.maxDiscount);
        finalPrice -= discount;
      } else {
        finalPrice -= sv.discountValue;
      }
    }
  });

  finalPrice = Math.max(0, finalPrice);

  const onCheckoutPress = () => {
    const platformVoucherIdsStr = selectedPlatformVouchers.length > 0 ? selectedPlatformVouchers.map(v => v.id).join(',') : undefined;
    const shopVoucherId = Object.values(selectedShopVouchers)[0]?.id;
    handleCheckout(platformVoucherIdsStr, shopVoucherId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.navigate('/')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={styles.headerRight}>
          {!isEmpty && (
            <Text style={styles.itemCount}>{summary.selectedCount} sản phẩm</Text>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={80} color="#DDD" />
            <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={styles.emptySubtitle}>Hãy thêm sản phẩm vào giỏ hàng nhé!</Text>
            <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.navigate('/')}>
              <Text style={styles.shopNowText}>Mua sắm ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CartShippingProgress currentAmount={summary.totalPrice} targetAmount={150000} />

            {sections.map((section) => (
              <CartSection
                key={section.shopId}
                shopId={section.shopId}
                shopName={section.shopName}
                checked={section.checked}
                items={section.items}
                voucherLabel="Voucher của Shop"
                voucherValue={selectedShopVouchers[section.shopId] ? `Đã chọn: ${selectedShopVouchers[section.shopId].code}` : 'Chọn hoặc nhập mã'}
                onToggleShop={handleToggleShop}
                onToggleItem={handleToggleItem}
                onIncreaseItem={handleIncreaseItem}
                onDecreaseItem={handleDecreaseItem}
                onPressVoucher={(id) => setActiveShopVoucherShopId(id)}
                onPressItem={handlePressItem}
                onDeleteShop={handleDeleteShop}
                onDeleteItem={handleDeleteItem}
              />
            ))}
            
            <View style={{ marginTop: 12 }}>
              <VoucherSelectorRow
                label="ShopeeLite Voucher"
                value={selectedPlatformVouchers.length > 0 ? `Đã chọn ${selectedPlatformVouchers.length} mã` : 'Chọn hoặc nhập mã'}
                onPress={() => setShowVoucherModal(true)}
              />
            </View>
          </>
        )}

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <View style={styles.recommendSection}>
            <View style={styles.recommendHeader}>
              <Text style={styles.recommendTitle}>Có thể bạn cũng thích</Text>
              <TouchableOpacity onPress={() => router.navigate('/')}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendScroll}
            >
              {recommendedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isHorizontal={true} 
                  onPress={handlePressProduct} 
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {!isEmpty && (
        <CartBottomBar
          allChecked={summary.allChecked}
          totalPrice={finalPrice}
          selectedCount={summary.selectedCount}
          onToggleAll={handleToggleAll}
          onCheckout={onCheckoutPress}
        />
      )}

      <PlatformVoucherModal
        visible={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        selectedVoucherCodes={selectedPlatformVouchers.map(v => v.code)}
        onApplyVouchers={setSelectedPlatformVouchers}
      />

      <ShopVoucherModal
        visible={!!activeShopVoucherShopId}
        onClose={() => setActiveShopVoucherShopId(null)}
        shopId={activeShopVoucherShopId ? parseInt(activeShopVoucherShopId) : undefined}
        mode="select"
        selectedVoucherId={activeShopVoucherShopId && selectedShopVouchers[activeShopVoucherShopId] ? selectedShopVouchers[activeShopVoucherShopId].id : undefined}
        onSelectVoucher={(voucher) => {
          if (activeShopVoucherShopId) {
            setSelectedShopVouchers(prev => ({
              ...prev,
              [activeShopVoucherShopId]: voucher
            }));
          }
          setActiveShopVoucherShopId(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    minWidth: 30,
    alignItems: 'flex-end',
  },
  itemCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingBottom: 24,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  shopNowBtn: {
    marginTop: 24,
    backgroundColor: '#EE4D2D',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopNowText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  // Recommend
  recommendSection: {
    marginTop: 16,
    backgroundColor: '#FFF',
    paddingVertical: 16,
  },
  recommendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  recommendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 13,
    color: '#EE4D2D',
    fontWeight: '600',
  },
  recommendScroll: {
    paddingHorizontal: 16,
  },
});
