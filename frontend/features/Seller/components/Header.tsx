import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  shopName: string;
  onBackPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ shopName, onBackPress, rightIcon, onRightPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.leftContainer}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.headerIconButton}>
            <Ionicons name="chevron-back" size={24} color="#1B1530" />
          </TouchableOpacity>
        )}
        <View style={styles.shopContainer}>
          <View style={styles.shopIcon}>
            <Ionicons name="storefront" size={20} color="#F73658" />
          </View>
          <Text style={styles.shopName} numberOfLines={1}>{shopName}</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        {rightIcon ? (
          <TouchableOpacity style={styles.headerIconButton} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={24} color="#F73658" />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#1B1530" />
              <View style={styles.badge} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="settings-outline" size={24} color="#1B1530" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFF1F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  shopIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF1F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B1530',
    maxWidth: 160,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 12,
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F73658',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});

export default Header;
