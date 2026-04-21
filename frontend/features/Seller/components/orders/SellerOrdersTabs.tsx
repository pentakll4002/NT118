import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OrderTab, OrderTabOption } from './orderTypes';

interface SellerOrdersTabsProps {
  tabs: OrderTabOption[];
  activeTab: OrderTab;
  onTabChange: (tab: OrderTab) => void;
}

const SellerOrdersTabs: React.FC<SellerOrdersTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsWrap}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive ? styles.tabActive : null]}
              onPress={() => onTabChange(tab.key)}
            >
              <Text style={[styles.tabText, isActive ? styles.tabTextActive : null]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsWrap: {
    gap: 8,
    paddingRight: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tabActive: {
    borderColor: '#ef476f',
    backgroundColor: '#fff1f4',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#ef476f',
  },
});

export default SellerOrdersTabs;
