import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from './cart.utils';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

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
  onDelete?: () => void;
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
  onDelete,
}: CartItemProps) {
  const renderRightActions = () => {
    return (
      <Pressable 
        style={styles.deleteAction} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDelete?.();
        }}
      >
        <Ionicons name="trash-outline" size={24} color="#FFF" />
        <Text style={styles.deleteText}>Xóa</Text>
      </Pressable>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} friction={2}>
      <View style={styles.container}>
        <Pressable
          style={[styles.checkbox, checked && styles.checkboxChecked]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle?.();
          }}
        >
          {checked && <Ionicons name="checkmark" size={14} color="#FFF" />}
        </Pressable>

        <Pressable style={styles.card} onPress={onPress}>
          <View style={styles.imageWrap}>
            <Image 
              source={image ? { uri: image } : require('../../assets/images/product/product-1.png')} 
              style={styles.image} 
              contentFit="cover"
              transition={200}
            />
          </View>

          <View style={styles.content}>
            <Text numberOfLines={2} style={[styles.name, disabled && styles.disabledText]}>
              {name}
            </Text>

            {!!variant && (
              <View style={styles.variantBadge}>
                <Text style={styles.variantText} numberOfLines={1}>
                  Phân loại: {variant}
                </Text>
                <Ionicons name="chevron-down" size={12} color="#9CA3AF" />
              </View>
            )}

            <View style={styles.footer}>
              <View style={styles.priceBlock}>
                <Text style={styles.price}>{formatPrice(price)}</Text>
                {originalPrice ? (
                  <Text style={styles.originalPrice}>
                    {formatPrice(originalPrice)}
                  </Text>
                ) : null}
              </View>

              <View style={styles.stepper}>
                <Pressable 
                  style={[styles.stepBtn, quantity <= 1 && styles.stepBtnDisabled]} 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onDecrease?.();
                  }}
                >
                  <Text style={[styles.stepText, quantity <= 1 && styles.stepTextDisabled]}>−</Text>
                </Pressable>

                <View style={styles.qtyBox}>
                  <Text style={styles.qtyText}>{quantity}</Text>
                </View>

                <Pressable 
                  style={styles.stepBtn} 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onIncrease?.();
                  }}
                >
                  <Text style={styles.stepText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  checkboxChecked: {
    borderColor: '#F83758',
    backgroundColor: '#F83758',
  },
  imageWrap: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 4,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  variantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  variantText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBlock: {
    flex: 1,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F83758',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 2,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepBtnDisabled: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  stepTextDisabled: {
    color: '#D1D5DB',
  },
  qtyBox: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  deleteAction: {
    backgroundColor: '#F83758',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginVertical: 8,
    marginRight: 12,
  },
  deleteText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});