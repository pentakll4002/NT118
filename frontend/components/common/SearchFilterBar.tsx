import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

interface SearchFilterBarProps {
  currentSort?: string;
  onSortChange: (sort: string) => void;
  onFilterPress: () => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ currentSort, onSortChange, onFilterPress }) => {
  const [activeTab, setActiveTab] = useState(currentSort || 'relevant');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);

  const tabs = [
    { id: 'relevant', label: 'Liên quan' },
    { id: 'newest', label: 'Mới nhất' },
    { id: 'popular', label: 'Bán chạy' },
  ];

  // Đồng bộ trạng thái từ prop currentSort nếu có
  useEffect(() => {
    if (currentSort) {
      if (currentSort.startsWith('price_')) {
        setActiveTab('price');
        setPriceSort(currentSort.split('_')[1] as 'asc' | 'desc');
      } else {
        setActiveTab(currentSort);
        setPriceSort(null);
      }
    }
  }, [currentSort]);

  const handleTabPress = (id: string) => {
    setActiveTab(id);
    setPriceSort(null);
    onSortChange(id);
  };

  const handlePricePress = () => {
    // Nếu chưa chọn Giá, mặc định là Tăng dần (asc)
    // Nếu đang là Tăng dần, đổi sang Giảm dần (desc) và ngược lại
    let nextSort: 'asc' | 'desc' = 'asc';
    if (activeTab === 'price') {
      nextSort = priceSort === 'asc' ? 'desc' : 'asc';
    }
    
    setActiveTab('price');
    setPriceSort(nextSort);
    onSortChange(`price_${nextSort}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity 
            key={tab.id} 
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => handleTabPress(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'price' && styles.activeTab]}
          onPress={handlePricePress}
        >
          <View style={styles.priceContainer}>
            <Text style={[styles.tabText, activeTab === 'price' && styles.activeTabText]}>Giá</Text>
            <View style={styles.priceIcons}>
              <Ionicons 
                name="caret-up" 
                size={11} 
                color={activeTab === 'price' && priceSort === 'asc' ? '#F73658' : '#BBBBBB'} 
              />
              <Ionicons 
                name="caret-down" 
                size={11} 
                color={activeTab === 'price' && priceSort === 'desc' ? '#F73658' : '#BBBBBB'} 
                style={{ marginTop: -5 }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
        <Text style={styles.filterText}>LỌC</Text>
        <Feather name="filter" size={14} color="#555" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
    height: 48,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#F73658',
  },
  tabText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat_500Medium',
  },
  activeTabText: {
    color: '#F73658',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceIcons: {
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#EEE',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Montserrat_500Medium',
  },
});

export default SearchFilterBar;
