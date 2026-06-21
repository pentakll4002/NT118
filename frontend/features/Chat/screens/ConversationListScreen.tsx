import { FlashList } from '@shopify/flash-list';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import ConversationItem, { Conversation } from '../components/ConversationItem';
import { LinearGradient } from 'expo-linear-gradient';
import { getConversations, ConversationDTO, useChatSignalR, RealtimeMessage } from '../../../lib/messageApi';

// AI assistant entry (always shown at top)
const AI_CONVERSATION: Conversation = {
  id: 'ai-assistant',
  name: 'Hỗ trợ khách hàng',
  lastMessage: 'Xin chào 👋 ShopeeLite có thể giúp gì cho bạn?',
  time: 'Luôn trực tuyến',
  isAI: true,
};

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút`;
  if (diffHours < 24) return `${diffHours} giờ`;
  if (diffDays < 7) return `${diffDays} ngày`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function dtoToConversation(dto: ConversationDTO): Conversation {
  return {
    id: dto.partnerId.toString(),
    partnerId: dto.partnerId,
    name: dto.partnerName,
    lastMessage: dto.lastMessage || '',
    time: formatMessageTime(dto.lastMessageTime),
    unreadCount: dto.unreadCount,
    avatar: dto.partnerAvatar,
  };
}

const ConversationListScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getConversations();
      setConversations(data.map(dtoToConversation));
    } catch (e) {
      console.log('Failed to load conversations:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConversations(false);
    }, [loadConversations])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  // Listen for real-time messages to update conversation list
  useChatSignalR(useCallback((msg: RealtimeMessage) => {
    setConversations(prev => {
      const partnerId = msg.senderId;
      const existing = prev.find(c => c.partnerId === partnerId);
      
      if (existing) {
        // Update existing conversation
        const updated = prev.map(c => 
          c.partnerId === partnerId
            ? {
                ...c,
                lastMessage: msg.content || '',
                time: 'Vừa xong',
                unreadCount: (c.unreadCount || 0) + 1,
              }
            : c
        );
        // Move to top
        const target = updated.find(c => c.partnerId === partnerId)!;
        return [target, ...updated.filter(c => c.partnerId !== partnerId)];
      } else {
        // New conversation - add to top
        const newConv: Conversation = {
          id: partnerId.toString(),
          partnerId,
          name: `User #${partnerId}`,
          lastMessage: msg.content || '',
          time: 'Vừa xong',
          unreadCount: 1,
        };
        return [newConv, ...prev];
      }
    });
  }, []));

  const allConversations = [AI_CONVERSATION, ...conversations];

  const filteredConversations = allConversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePress = (item: Conversation) => {
    if (item.isAI) {
      router.push('/chat/ai');
    } else {
      router.push({
        pathname: '/chat/[id]',
        params: { id: item.partnerId?.toString() || item.id, name: item.name }
      });
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FAF7FF', '#F1F5FF']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#1B1530" />
          </TouchableOpacity>
          <Text style={styles.title}>Tin nhắn</Text>
          <TouchableOpacity style={styles.backButton}>
            <Feather name="edit" size={20} color="#1B1530" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#A29DBA" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#A29DBA"
            />
          </View>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C5CFF" />
            <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
          </View>
        ) : (
          <FlashList data={filteredConversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ConversationItem item={item} onPress={() => handlePress(item)} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7C5CFF']} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="message-square" size={48} color="#E5E1F2" />
                <Text style={styles.emptyText}>Chưa có cuộc hội thoại nào</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B1530',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1B1530',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#A29DBA',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#A29DBA',
  },
});

export default ConversationListScreen;
