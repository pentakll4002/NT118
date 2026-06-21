import { FlashList } from '@shopify/flash-list';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { TabModel, NotificationItemModel, toNotificationItem, TABS } from './notification.types';
import { useNotifications, useNotificationSignalR } from '@/lib/notificationApi';
import NotificationCard from './NotificationCard';
import { useRouter } from 'expo-router';

export default function NotificationContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const { notifications, loading, load, handleRealtimeNotification, markRead, markAllRead } = useNotifications();

  // Fetch on mount
  useEffect(() => { load(); }, [load]);

  // SignalR realtime (shared with tab layout — only connect if not already)
  useNotificationSignalR(handleRealtimeNotification);

  // Convert backend → UI models
  const uiItems = useMemo(() => notifications.map(toNotificationItem), [notifications]);

  const filteredData = useMemo(() => {
    if (activeTab === 'ALL') return uiItems;
    return uiItems.filter((item) => item.type === activeTab);
  }, [uiItems, activeTab]);

  const recentNotifications = useMemo(() => filteredData.filter((i) => !i.isOlder), [filteredData]);
  const olderNotifications = useMemo(() => filteredData.filter((i) => i.isOlder), [filteredData]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

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
    if (loading && notifications.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4747" />
        </View>
      );
    }

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
      <FlashList data={listData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.isSectionHeader) {
            return (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{item.title}</Text>
              </View>
            );
          }
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (!item.isRead) markRead(item.backendId);
                // Navigate to order detail if ORDER type with orderId in data
                if (item.type === 'ORDER' && item.rawData) {
                  try {
                    const parsed = JSON.parse(item.rawData);
                    console.log('Notification rawData parsed:', parsed);
                    if (parsed.orderId && parsed.orderId > 0) {
                      router.push(`/order/${parsed.orderId}` as any);
                    } else {
                      console.log('No valid orderId in notification data:', item.rawData);
                    }
                  } catch (e) {
                    console.log('Failed to parse notification rawData:', e, item.rawData);
                  }
                }
              }}
            >
              <NotificationCard item={item} />
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF4747']} />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markAllText}>Đọc tất cả</Text>
        </TouchableOpacity>
      </View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  markAllText: {
    fontSize: 13,
    color: '#FF4747',
    fontWeight: '600',
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
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
