import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProductHeaderProps {
  searchPlaceholder?: string;
  onSearchChange?: (text: string) => void;
  onSettingsPress?: () => void;
  onFilterPress?: () => void;
  onBackPress?: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  searchPlaceholder = 'Tìm kiếm tên sản phẩm...',
  onSearchChange,
  onSettingsPress,
  onFilterPress,
  onBackPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          {onBackPress && (
            <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#1e293b" />
            </TouchableOpacity>
          )}
          <View style={styles.logoCircle}>
            <Ionicons name="storefront" size={18} color="#ffffff" />
          </View>
          <Text style={styles.titleText}>ShopeeLite Seller</Text>
        </View>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={onSettingsPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="settings-outline" size={22} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={searchPlaceholder}
          placeholderTextColor="#94a3b8"
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
        <View style={styles.searchDivider} />
        <TouchableOpacity onPress={onFilterPress} style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  // Title
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 8,
    padding: 2,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 6,
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    paddingVertical: 0,
  },
  searchDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 8,
  },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
});

export default ProductHeader;
