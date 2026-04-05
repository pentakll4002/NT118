import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { TabModel } from './notification.types';
import { MOCK_NOTIFICATIONS, TABS } from './notification.mock';
import NotificationCard from './NotificationCard';

export default function NotificationContent() {
  const [activeTab, setActiveTab] = useState<string>('ORDER');

  const filteredData = useMemo(() => {
    return MOCK_NOTIFICATIONS.filter((item) => item.type === activeTab);
  }, [activeTab]);

  const recentNotifications = useMemo(() => filteredData.filter((i) => !i.isOlder), [filteredData]);
  const olderNotifications = useMemo(() => filteredData.filter((i) => i.isOlder), [filteredData]);

  const renderTab = (item: TabModel) => {
    const isActive = activeTab === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.tabItem, isActive && styles.tabItemActive]}
        onPress={() => setActiveTab(item.id)}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bell-off" size={48} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
      <Text style={styles.emptySubtitle}>Các cập nhật mới sẽ hiển thị tại đây</Text>
    </View>
  );

  const renderContent = () => {
    if (filteredData.length === 0) {
      return renderEmptyState();
    }

    const listData: any[] = [];
    if (recentNotifications.length > 0) {
      listData.push(...recentNotifications);
    }
    if (olderNotifications.length > 0) {
      listData.push({ isSectionHeader: true, title: 'THÔNG BÁO CŨ HƠN', id: 'section-older' });
      listData.push(...olderNotifications);
    }

    return (
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.isSectionHeader) {
            return (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{item.title}</Text>
              </View>
            );
          }
          return <NotificationCard item={item} />;
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabsContainer}
        >
          {TABS.map(renderTab)}
        </ScrollView>
      </View>

      {/* List */}
      <View style={styles.listWrapper}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabsContainer: {
    paddingHorizontal: 8,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#FF4747',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FF4747',
    fontWeight: '600',
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
