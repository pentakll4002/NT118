import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFavoriteCount } from '../../lib/wishlistApi';

const { width } = Dimensions.get('window');

interface WishlistBannerProps {
  onPress?: () => void;
}

const WishlistBanner: React.FC<WishlistBannerProps> = ({ onPress }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadCount();
  }, []);

  const loadCount = async () => {
    try {
      const c = await getFavoriteCount();
      setCount(c);
    } catch {
      // not logged in
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.gradient}>
        <View style={styles.iconContainer}>
          <Ionicons name="heart" size={28} color="#FFF" />
          {count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Danh sách yêu thích</Text>
          <Text style={styles.subtitle}>
            {count > 0
              ? `${count} sản phẩm đã lưu`
              : 'Chưa có sản phẩm yêu thích'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F83758',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#F83758',
    borderRadius: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#F83758',
    fontSize: 10,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '400',
  },
});

export default WishlistBanner;
