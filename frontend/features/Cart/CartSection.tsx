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
  onDeleteShop?: (shopId: string) => void;
  onDeleteItem?: (shopId: string, itemId: string) => void;
};

export default function CartSection({
  shopId,
  shopName,
  checked,
  items,
  voucherLabel = 'Voucher của Shop',
  voucherValue = 'Chọn hoặc nhập mã',
  onToggleShop,
  onPressShop,
  onToggleItem,
  onIncreaseItem,
  onDecreaseItem,
  onPressItem,
  onPressVoucher,
  onDeleteShop,
  onDeleteItem,
}: CartSectionProps) {
  return (
    <View style={styles.container}>
      <CartShopHeader
        checked={checked}
        shopName={shopName}
        onToggle={() => onToggleShop?.(shopId)}
        onPressShop={() => onPressShop?.(shopId)}
        onDeleteShop={() => onDeleteShop?.(shopId)}
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
              onDelete={() => onDeleteItem?.(shopId, item.id)}
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
    marginHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemsWrap: {
    backgroundColor: '#fff',
  },
  itemRow: {
    backgroundColor: '#fff',
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
});