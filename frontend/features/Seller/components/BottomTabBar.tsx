import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';

const BottomTabBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: 'Trang chủ', icon: 'home', route: '/seller-dashboard' },
    { name: 'Sản phẩm', icon: 'cube-outline', route: '/seller-products' },
    { name: 'Đơn hàng', icon: 'receipt-outline', route: '/seller-orders' },
    { name: 'Chat', icon: 'chatbubbles-outline', route: '/chat' },
    { name: 'Shop', icon: 'person-outline', route: '/seller-shop-profile' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {tabs.map((tab, index) => {
        const isActive = pathname === tab.route;
        return (
          <TouchableOpacity 
            key={index} 
            style={styles.tabItem} 
            activeOpacity={0.7}
            onPress={() => router.push(tab.route as any)}
          >
            <Ionicons 
              name={isActive ? (tab.icon.replace('-outline', '') as any) : (tab.icon as any)} 
              size={24} 
              color={isActive ? '#3498db' : '#95a5a6'} 
            />
            <Text style={[styles.tabLabel, isActive ? styles.activeLabel : null]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    color: '#95a5a6',
    marginTop: 4,
    fontWeight: '500',
  },
  activeLabel: {
    color: '#3498db',
    fontWeight: '700',
  },
});

export default BottomTabBar;
