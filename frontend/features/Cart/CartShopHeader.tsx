import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type CartShopHeaderProps = {
  checked: boolean;
  shopName: string;
  onToggle?: () => void;
  onPressShop?: () => void;
};

export default function CartShopHeader({
  checked,
  shopName,
  onToggle,
  onPressShop,
}: CartShopHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.checkbox, checked && styles.checkboxChecked]}
        onPress={onToggle}
      >
        {checked ? <View style={styles.checkboxInner} /> : null}
      </Pressable>

      <Pressable style={styles.shopRow} onPress={onPressShop}>
        <Text style={styles.mallBadge}>Mall</Text>
        <Text style={styles.shopName} numberOfLines={1}>
          {shopName}
        </Text>
        <Text style={styles.arrow}>{'>'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  checkbox: {
    width: 20,
    height: 20,
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
  shopRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mallBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 8,
  },
  shopName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  arrow: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 6,
  },
});