import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, ProductStatus } from '../../data/mockProducts';


/** Map status → display label */
const statusLabel: Record<ProductStatus, string> = {
  live: 'LIVE',
  sold_out: 'SOLD OUT',
  reviewing: 'REVIEWING',
};

/** Map status → badge colour */
const statusColor: Record<ProductStatus, { bg: string; text: string }> = {
  live: { bg: '#3b82f6', text: '#ffffff' },
  sold_out: { bg: '#ef4444', text: '#ffffff' },
  reviewing: { bg: '#f59e0b', text: '#ffffff' },
};

/** Format VND price */
const formatPrice = (price: number): string =>
  price.toLocaleString('vi-VN') + 'đ';


interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onMore?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onMore }) => {
  const badge = statusColor[product.status];

  return (
    <View style={styles.container}>
      {/* ——— Product image ——— */}
      <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />

      {/* ——— Info section ——— */}
      <View style={styles.infoContainer}>
        {/* Name + Status row */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {statusLabel[product.status]}
            </Text>
          </View>
        </View>

        {/* Price + Stock */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>GIÁ NIÊM YẾT</Text>
            <Text style={styles.metaValue}>{formatPrice(product.price)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>KHO HÀNG</Text>
            <Text
              style={[
                styles.metaValue,
                product.stock === 0 && styles.outOfStock,
              ]}
            >
              {product.stock} sản phẩm
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.editButton} onPress={() => onEdit?.(product)}>
            <Text style={styles.editText}>EDIT</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onMore?.(product)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#95a5a6" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    padding: 14,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#2c3e50',
    lineHeight: 20,
  },
  badge: {
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 24,
  },
  metaItem: {},
  metaLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#95a5a6',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
  },
  outOfStock: {
    color: '#ef4444',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 10,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2c3e50',
    letterSpacing: 0.5,
  },
});

export default ProductCard;
