import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CartBottomBar from '../../features/Cart/CartBottomBar';
import CartSection from '../../features/Cart/CartSection';
import CartShippingProgress from '../../features/Cart/CartShippingProgress';
import useCartScreen from '../../features/Cart/useCartScreen';
import ProductCard from '../common/ProductCard';

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
    handleCheckout,
  } = useCartScreen();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.navigate('/')}>
          <Feather name="arrow-left" size={24} color="#FF4747" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ backgroundColor: '#F5F5F5' }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.shippingProgressContainer}>
          <CartShippingProgress currentAmount={summary.totalPrice} targetAmount={150000} />
        </View>

        {sections.map((section) => (
          <CartSection
            key={section.shopId}
            shopId={section.shopId}
            shopName={section.shopName}
            checked={section.checked}
            items={section.items}
            voucherLabel={section.voucherLabel}
            voucherValue={section.voucherValue}
            onToggleShop={handleToggleShop}
            onToggleItem={handleToggleItem}
            onIncreaseItem={handleIncreaseItem}
            onDecreaseItem={handleDecreaseItem}
            onPressVoucher={handlePressVoucher}
          />
        ))}

        <View style={styles.recommendSection}>
          <Text style={styles.recommendTitle}>Gợi ý cho bạn</Text>

          <View style={styles.grid}>
            {recommendedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={handlePressProduct}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <CartBottomBar
        allChecked={summary.allChecked}
        totalPrice={summary.totalPrice}
        selectedCount={summary.selectedCount}
        onToggleAll={handleToggleAll}
        onCheckout={handleCheckout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  shippingProgressContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
  },
  content: {
    paddingBottom: 24,
    backgroundColor: '#F5F5F5',
  },
  recommendSection: {
    marginTop: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
  },
  recommendTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
  },
});
