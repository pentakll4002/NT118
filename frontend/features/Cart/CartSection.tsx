import React from 'react';
import { StyleSheet, View } from 'react-native';
import CartShopHeader from './CartShopHeader';
import CartItem from './CartItem';
import VoucherSelectorRow from './VoucherSelectorRow';
import { CartItemType } from './cart.types';

type CartSectionProps = {
  shopId: string;
  shopName: string;
  checked: boolean;
  items: CartItemType[];
  voucherLabel?: string;
  voucherValue?: string;
  onToggleShop?: (shopId: string) => void;
  onPressShop?: (shopId: string) => void;
  onToggleItem?: (shopId: string, itemId: string) => void;
  onIncreaseItem?: (shopId: string, itemId: string) => void;
  onDecreaseItem?: (shopId: string, itemId: string) => void;
  onPressItem?: (shopId: string, itemId: string) => void;
  onPressVoucher?: (shopId: string) => void;
};

export default function CartSection({
  shopId,
  shopName,
  checked,
  items,
  voucherLabel = 'ShopeeLite Voucher',
  voucherValue = 'Chọn hoặc nhập mã',
  onToggleShop,
  onPressShop,
  onToggleItem,
  onIncreaseItem,
  onDecreaseItem,
  onPressItem,
  onPressVoucher,
}: CartSectionProps) {
  return (
    <View style={styles.container}>
      <CartShopHeader
        checked={checked}
        shopName={shopName}
        onToggle={() => onToggleShop?.(shopId)}
        onPressShop={() => onPressShop?.(shopId)}
      />

      <View style={styles.itemsWrap}>
        {items.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.itemRow,
              index !== items.length - 1 && styles.itemDivider,
            ]}
          >
            <CartItem
              checked={item.checked}
              image={item.image}
              name={item.name}
              variant={item.variant}
              price={item.price}
              originalPrice={item.originalPrice}
              quantity={item.quantity}
              disabled={item.disabled}
              onToggle={() => onToggleItem?.(shopId, item.id)}
              onIncrease={() => onIncreaseItem?.(shopId, item.id)}
              onDecrease={() => onDecreaseItem?.(shopId, item.id)}
              onPress={() => onPressItem?.(shopId, item.id)}
            />
          </View>
        ))}
      </View>

      <VoucherSelectorRow
        label={voucherLabel}
        value={voucherValue}
        onPress={() => onPressVoucher?.(shopId)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  itemsWrap: {
    backgroundColor: '#fff',
  },
  itemRow: {
    backgroundColor: '#fff',
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
});