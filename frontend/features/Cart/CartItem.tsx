import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { formatPrice } from './cart.utils';

type CartItemProps = {
  checked: boolean;
  image: string;
  name: string;
  variant?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  disabled?: boolean;
  onToggle?: () => void;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onPress?: () => void;
};


export default function CartItem({
  checked,
  image,
  name,
  variant,
  price,
  originalPrice,
  quantity,
  disabled = false,
  onToggle,
  onIncrease,
  onDecrease,
  onPress,
}: CartItemProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.checkbox, checked && styles.checkboxChecked]}
        onPress={onToggle}
      >
        {checked ? <View style={styles.checkboxInner} /> : null}
      </Pressable>

      <Pressable style={styles.card} onPress={onPress}>
        <Image source={{ uri: image }} style={styles.image} />

        <View style={styles.content}>
          <Text numberOfLines={2} style={[styles.name, disabled && styles.disabledText]}>
            {name}
          </Text>

          {!!variant && (
            <Text style={styles.variant} numberOfLines={1}>
              {variant}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.priceBlock}>
              {originalPrice ? (
                <Text style={styles.originalPrice}>
                  {formatPrice(originalPrice)}
                </Text>
              ) : null}

              <Text style={styles.price}>{formatPrice(price)}</Text>
            </View>

            <View style={styles.stepper}>
              <Pressable style={styles.stepBtn} onPress={onDecrease}>
                <Text style={styles.stepText}>-</Text>
              </Pressable>

              <View style={styles.qtyBox}>
                <Text style={styles.qtyText}>{quantity}</Text>
              </View>

              <Pressable style={styles.stepBtn} onPress={onIncrease}>
                <Text style={styles.stepText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const BOX_SIZE = 20;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  checkbox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    borderColor: '#FF4D4F',
    backgroundColor: '#FF4D4F',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  variant: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  priceBlock: {
    flex: 1,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  qtyBox: {
    minWidth: 32,
    height: 28,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  qtyText: {
    fontSize: 14,
    color: '#111827',
  },
});