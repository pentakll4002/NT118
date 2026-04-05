import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type VoucherSelectorRowProps = {
  label?: string;
  value?: string;
  onPress?: () => void;
};

export default function VoucherSelectorRow({
  label = 'Voucher',
  value = 'Chọn hoặc nhập mã',
  onPress,
}: VoucherSelectorRowProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🎟</Text>
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.arrow}>{'>'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  iconText: {
    fontSize: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '52%',
  },
  value: {
    fontSize: 13,
    color: '#6B7280',
  },
  arrow: {
    marginLeft: 6,
    color: '#9CA3AF',
  },
});