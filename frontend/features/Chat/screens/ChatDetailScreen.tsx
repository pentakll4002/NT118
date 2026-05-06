import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  getMessages,
  sendMessage,
  markConversationRead,
  useChatSignalR,
  MessageDTO,
  RealtimeMessage,
} from '../../../lib/messageApi';
import { userApi } from '../../../lib/userApi';

type DisplayMessage = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
  type?: 'text' | 'image' | 'product';
  imageUrl?: string;
  isRead?: boolean;
  productInfo?: {
    id: number;
    name: string;
    price: string;
    image: string;
  };
};

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const ChatDetailScreen = () => {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const receiverId = Number(id);

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Load current user ID
  useEffect(() => {
    (async () => {
      try {
        const profile = await userApi.getProfile();
        if (profile?.id) setCurrentUserId(Number(profile.id));
      } catch {
        // If can't get profile, we'll still try to load messages
      }
    })();
  }, []);

  // Load message history
  useEffect(() => {
    if (!receiverId || currentUserId === null) return;

    (async () => {
      try {
        setLoading(true);
        const data = await getMessages(receiverId);
        
        // API returns newest first, reverse for display (oldest first)
        const displayMsgs: DisplayMessage[] = data.reverse().map((m: MessageDTO) => ({
          id: m.id.toString(),
          text: m.content || '',
          sender: m.senderId === currentUserId ? 'me' : 'other',
          time: formatTime(m.sentAt),
          type: (m.messageType as any) || 'text',
          imageUrl: m.attachmentUrl || undefined,
          isRead: m.isRead,
        }));

        setMessages(displayMsgs);

        // Mark conversation as read
        await markConversationRead(receiverId).catch(() => {});
      } catch (e) {
        console.log('Failed to load messages:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [receiverId, currentUserId]);

  // Listen for real-time incoming messages
  useChatSignalR(useCallback((msg: RealtimeMessage) => {
    // Only process messages from the current conversation partner
    if (msg.senderId !== receiverId) return;

    const displayMsg: DisplayMessage = {
      id: msg.id.toString(),
      text: msg.content || '',
      sender: 'other',
      time: formatTime(msg.sentAt),
    };

    setMessages(prev => [...prev, displayMsg]);

    // Mark as read since we're viewing the conversation
    markConversationRead(receiverId).catch(() => {});
  }, [receiverId]));

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages]);

  const handleSend = async (textOverride?: string, type: 'text' | 'image' | 'product' = 'text', attachment?: string) => {
    const text = textOverride ?? draft.trim();
    if (!text && !attachment) return;
    if (sending) return;

    // Optimistically add message to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: DisplayMessage = {
      id: tempId,
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      imageUrl: attachment,
      isRead: false,
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setDraft('');
    setSending(true);

    try {
      const result = await sendMessage({
        receiverId,
        content: text,
        messageType: type,
        attachmentUrl: attachment,
      });

      // Replace temp ID with real ID
      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...m, id: result.messageId.toString() } : m)
      );
    } catch (e) {
      console.log('Failed to send message:', e);
      // Mark failed message
      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...m, text: `${m.text} ⚠️` } : m)
      );
    } finally {
      setSending(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      // In a real app, you would upload the image to a server first
      // For now, we use the local URI as the attachmentUrl
      handleSend('', 'image', result.assets[0].uri);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FAF7FF', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Feather name="chevron-left" size={24} color="#1B1530" />
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: `https://i.pravatar.cc/100?u=${receiverId}` }} 
              style={styles.avatar} 
            />
            <View>
              <Text style={styles.userName}>{name || 'Shop'}</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Đang hoạt động</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.iconButton}>
            <Feather name="phone" size={20} color="#1B1530" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C5CFF" />
              <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.messageWrapper, item.sender === 'me' ? styles.myWrapper : styles.otherWrapper]}>
                  <View style={[styles.bubble, item.sender === 'me' ? styles.myBubble : styles.otherBubble, item.type === 'image' && styles.imageBubble]}>
                    {item.type === 'image' && item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
                    ) : null}
                    
                    {item.text ? (
                      <Text style={[styles.messageText, item.sender === 'me' ? styles.myText : styles.otherText]}>
                        {item.text}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.messageFooter}>
                    <Text style={styles.timeText}>{item.time}</Text>
                    {item.sender === 'me' && (
                      <Ionicons 
                        name={item.isRead ? "checkmark-done" : "checkmark"} 
                        size={14} 
                        color={item.isRead ? "#7C5CFF" : "#A29DBA"} 
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </View>
                </View>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyChat}>
                  <Feather name="message-circle" size={48} color="#E5E1F2" />
                  <Text style={styles.emptyChatText}>Bắt đầu cuộc trò chuyện!</Text>
                  <Text style={styles.emptyChatSub}>Gửi tin nhắn đầu tiên cho {name || 'shop'}</Text>
                </View>
              }
            />
          )}

          {/* Composer */}
          <View style={styles.composerWrap}>
            <View style={styles.composer}>
              <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage}>
                <Feather name="image" size={20} color="#7C5CFF" />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Nhập tin nhắn..."
                value={draft}
                onChangeText={setDraft}
                multiline
                editable={!sending}
              />
              <TouchableOpacity 
                style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]} 
                onPress={() => handleSend()}
                disabled={!draft.trim() || sending}
              >
                <LinearGradient 
                  colors={draft.trim() ? ['#7C5CFF', '#FF8FB1'] : ['#D1D5DB', '#D1D5DB']} 
                  style={styles.sendGradient}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Feather name="send" size={18} color="#FFFFFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF7FF' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 92, 255, 0.08)',
  },
  userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#F1F5FF' },
  userName: { fontSize: 16, fontWeight: '700', color: '#1B1530' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  statusText: { fontSize: 11, color: '#A29DBA' },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#A29DBA' },

  listContent: { padding: 16, paddingBottom: 20, flexGrow: 1 },
  messageWrapper: { marginBottom: 16, maxWidth: '80%' },
  myWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  myBubble: { backgroundColor: '#7C5CFF', borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(124, 92, 255, 0.1)' },
  messageText: { fontSize: 15, lineHeight: 21 },
  myText: { color: '#FFFFFF' },
  otherText: { color: '#1B1530' },
  timeText: { fontSize: 10, color: '#A29DBA', marginTop: 4 },

  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyChatText: { fontSize: 18, fontWeight: '700', color: '#1B1530', marginTop: 16 },
  emptyChatSub: { fontSize: 14, color: '#A29DBA', marginTop: 6 },

  composerWrap: { padding: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: 'rgba(124, 92, 255, 0.08)' },
  composer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FE', borderRadius: 24, paddingHorizontal: 8, paddingVertical: 6 },
  attachBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, paddingHorizontal: 12, fontSize: 15, color: '#1B1530', maxHeight: 100 },
  sendBtn: { marginLeft: 8 },
  sendBtnDisabled: { opacity: 0.6 },
  sendGradient: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },

  messageImage: { width: 200, height: 200, borderRadius: 12, marginBottom: 4 },
  imageBubble: { padding: 4 },
  messageFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
});

export default ChatDetailScreen;
