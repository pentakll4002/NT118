import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FilterTab, filterTabs } from '../../data/mockProducts';

// ============================
// Props
// ============================
interface ProductFilterTabsProps {
  /** Currently selected filter key */
  activeTab: FilterTab;
  /** Callback when user taps a different tab */
  onTabChange: (tab: FilterTab) => void;
}

// ============================
// Component
// ============================
const ProductFilterTabs: React.FC<ProductFilterTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filterTabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ============================
// Styles
// ============================
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2c3e50',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#95a5a6',
    letterSpacing: 0.3,
  },
  activeLabel: {
    color: '#2c3e50',
  },
});

export default ProductFilterTabs;
