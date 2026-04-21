import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SellerOrdersHeaderProps {
  onBackPress: () => void;
}

const SellerOrdersHeader: React.FC<SellerOrdersHeaderProps> = ({ onBackPress }) => {
  const insets = useSafeAreaInsets();
  const androidTopInset = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, androidTopInset) + 6 }]}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={22} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.brand}>ShopeeLite Seller</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={20} color="#2c3e50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings-outline" size={20} color="#2c3e50" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.title}>Quản lý Đơn hàng</Text>
      <Text style={styles.subtitle}>Theo dõi và xử lý các giao dịch của bạn</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eceef3',
  },
  headerTop: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    padding: 4,
  },
  title: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },
});

export default SellerOrdersHeader;
