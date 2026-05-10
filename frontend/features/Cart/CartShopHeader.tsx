import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';

type CartShopHeaderProps = {
  checked: boolean;
  shopName: string;
  onToggle?: () => void;
  onPressShop?: () => void;
  onDeleteShop?: () => void;
};

export default function CartShopHeader({
  checked,
  shopName,
  onToggle,
  onPressShop,
  onDeleteShop,
}: CartShopHeaderProps) {
  const [showDelete, setShowDelete] = useState(false);
  const anim = useSharedValue(0);

  const toggleDelete = () => {
    const nextState = !showDelete;
    setShowDelete(nextState);
    anim.value = withTiming(nextState ? 1 : 0, { duration: 300 });
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa shop',
      `Bạn có chắc muốn xóa toàn bộ sản phẩm của ${shopName} khỏi giỏ hàng?`,
      [
        { text: 'Hủy', style: 'cancel', onPress: () => toggleDelete() },
        { 
          text: 'Xóa', 
          style: 'destructive', 
          onPress: () => {
            onDeleteShop?.();
            toggleDelete();
          } 
        },
      ]
    );
  };

  const deleteBtnStyle = useAnimatedStyle(() => ({
    width: interpolate(anim.value, [0, 1], [0, 70]),
    opacity: anim.value,
    transform: [{ translateX: interpolate(anim.value, [0, 1], [20, 0]) }],
  }));

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.checkbox, checked && styles.checkboxChecked]}
        onPress={onToggle}
      >
        {checked && <Ionicons name="checkmark" size={14} color="#FFF" />}
      </Pressable>

      <Pressable style={styles.shopRow} onPress={onPressShop}>
        <View style={styles.mallBadge}>
          <Ionicons name="storefront" size={10} color="#EE4D2D" />
          <Text style={styles.mallText}>Mall</Text>
        </View>
        <Text style={styles.shopName} numberOfLines={1}>
          {shopName}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </Pressable>

      <View style={styles.rightActions}>
        <Animated.View style={[styles.deleteBtnWrapper, deleteBtnStyle]}>
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteText}>Xóa</Text>
          </Pressable>
        </Animated.View>

        <Pressable style={styles.moreBtn} onPress={toggleDelete}>
          <Ionicons 
            name={showDelete ? "close" : "ellipsis-vertical"} 
            size={18} 
            color="#9CA3AF" 
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
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
  },
  checkboxChecked: {
    borderColor: '#F83758',
    backgroundColor: '#F83758',
  },
  shopRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F83758',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mallText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  shopName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreBtn: {
    padding: 6,
    marginLeft: 4,
    zIndex: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  deleteBtnWrapper: {
    height: 32,
    overflow: 'hidden',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#F83758',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginRight: 4,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});