import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { sendChatMessage } from '@/lib/chatApi';

export type ChatMessage = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
  sources?: string[];
};

type ChatUIProps = {
  title?: string;
  subtitle?: string;
  initialMessages?: ChatMessage[];
  onBackPress?: () => void;
};

const defaultMessages: ChatMessage[] = [
  { id: '1', text: 'Xin chào 👋 Mình có thể giúp gì cho bạn hôm nay?', sender: 'other', time: '09:15' },
];

/* ---------- Design tokens (light, pastel, soft) ---------- */
const C = {
  bg: '#FAF7FF',           // nền lavender rất nhạt
  bgSoft: '#F1F5FF',
  surface: '#FFFFFF',
  surfaceMuted: 'rgba(255,255,255,0.7)',
  border: 'rgba(124, 92, 255, 0.10)',
  text: '#1B1530',
  textMuted: '#6B6486',
  textDim: '#A29DBA',
  primary: '#7C5CFF',      // tím
  primary2: '#FF8FB1',     // hồng
  accent: '#5EEAD4',       // mint
  bubbleOther: '#FFFFFF',
  danger: '#E11D48',
  shadow: 'rgba(124, 92, 255, 0.18)',
};

/* ---------- Typing dots animation ---------- */
const TypingDots: React.FC = () => {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const anims = dots.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 420, delay: i * 140, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 420, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ),
    );
    Animated.parallel(anims).start();
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }],
            },
          ]}
        />
      ))}
    </View>
  );
};

/* ---------- Bot avatar ---------- */
const BotAvatar: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <LinearGradient
    colors={[C.primary, C.primary2]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
  >
    <Feather name="zap" size={size * 0.5} color="#FFFFFF" />
  </LinearGradient>
);

/* ---------- Message bubble ---------- */
const MessageBubble: React.FC<{ item: ChatMessage }> = ({ item }) => {
  const isMe = item.sender === 'me';
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageRow,
        isMe ? styles.myRow : styles.otherRow,
        { opacity: fade, transform: [{ translateY: slide }] },
      ]}
    >
      {!isMe && <BotAvatar />}

      <View style={{ maxWidth: '78%' }}>
        {isMe ? (
          <LinearGradient
            colors={[C.primary, C.primary2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.myBubble]}
          >
            <Text style={[styles.messageText, styles.myText]}>{item.text}</Text>
            <Text style={[styles.timeText, styles.myTime]}>{item.time}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.otherBubble]}>
            <Text style={[styles.messageText, styles.otherText]}>{item.text}</Text>
            {item.sources && item.sources.length > 0 ? (
              <View style={styles.sourcesWrap}>
                <View style={styles.sourcesHeader}>
                  <Feather name="link-2" size={10} color={C.primary} />
                  <Text style={styles.sourcesTitle}>Nguồn tham khảo</Text>
                </View>
                {item.sources.slice(0, 3).map((source, idx) => (
                  <Text key={`${item.id}-source-${idx}`} style={styles.sourceItem} numberOfLines={1}>
                    • {source}
                  </Text>
                ))}
              </View>
            ) : null}
            <Text style={[styles.timeText, styles.otherTime]}>{item.time}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

/* ---------- Main ---------- */
const ChatUI: React.FC<ChatUIProps> = ({
  title = 'Trợ lý AI',
  subtitle = 'Online • phản hồi tức thì',
  initialMessages = defaultMessages,
  onBackPress,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const sortedMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages, isSending]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || isSending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: content,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setErrorMessage(null);
    setIsSending(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 70000);

    try {
      const conversationHistory = sortedMessages.map((m) => ({
        role: m.sender === 'me' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

      const response = await sendChatMessage({
        message: content,
        conversation_history: conversationHistory,
        use_rag: true,
        signal: controller.signal,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          text: response.answer,
          sender: 'other',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: response.sources,
        },
      ]);
    } catch (error) {
      const fallback = 'Không kết nối được chatbot. Kiểm tra server ai-agentic và thử lại.';
      const message = error instanceof Error && error.message ? error.message : fallback;
      setErrorMessage(message);
    } finally {
      clearTimeout(timeoutId);
      setIsSending(false);
    }
  };

  const canSend = draft.trim().length > 0 && !isSending;

  return (
    <View style={styles.root}>
      {/* Pastel background gradient + soft blobs */}
      <LinearGradient
        colors={[C.bg, '#FFF1F7', '#EAFBF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />
      <View style={[styles.blob, styles.blobC]} />

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton} activeOpacity={0.7}>
            <Feather name="chevron-left" size={22} color={C.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <BotAvatar size={36} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              <View style={styles.subRow}>
                <View style={styles.statusDot} />
                <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Feather name="more-vertical" size={20} color={C.text} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={8}
        >
          <FlatList
            ref={listRef}
            data={sortedMessages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            renderItem={({ item }) => <MessageBubble item={item} />}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />

          {isSending ? (
            <View style={[styles.messageRow, styles.otherRow, { paddingHorizontal: 16, paddingBottom: 6 }]}>
              <BotAvatar />
              <View style={[styles.bubble, styles.otherBubble, styles.typingBubble]}>
                <TypingDots />
              </View>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorWrap}>
              <Feather name="alert-circle" size={14} color={C.danger} />
              <Text style={styles.errorText} numberOfLines={2}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Composer */}
          <View style={styles.composerWrap}>
            <View style={styles.composer}>
              <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
                <Feather name="plus" size={18} color={C.primary} />
              </TouchableOpacity>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Nhập tin nhắn..."
                style={styles.input}
                placeholderTextColor={C.textDim}
                multiline
                maxLength={2000}
              />
              <TouchableOpacity
                onPress={handleSend}
                activeOpacity={0.85}
                disabled={!canSend}
                style={{ borderRadius: 22 }}
              >
                <LinearGradient
                  colors={canSend ? [C.primary, C.primary2] : ['#E5E1F2', '#E5E1F2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sendButton}
                >
                  <Feather name="send" size={18} color={canSend ? '#FFFFFF' : C.textDim} />
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
  root: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },

  // ambient pastel blobs (glow)
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.55 },
  blobA: { width: 280, height: 280, backgroundColor: '#E9DDFF', top: -100, left: -80 },
  blobB: { width: 240, height: 240, backgroundColor: '#FFE0EC', top: 120, right: -90 },
  blobC: { width: 260, height: 260, backgroundColor: '#D6F7EE', bottom: -100, left: -60, opacity: 0.5 },

  // header (glass)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 6 },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  title: { fontSize: 15, fontWeight: '700', color: C.text, letterSpacing: 0.2 },
  subRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  subtitle: { fontSize: 11, color: C.textMuted },

  // avatar
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: C.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  // list
  messageList: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 10 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end' },
  myRow: { justifyContent: 'flex-end' },
  otherRow: { justifyContent: 'flex-start' },

  // bubble
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myBubble: {
    borderBottomRightRadius: 6,
    shadowColor: C.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  otherBubble: {
    backgroundColor: C.bubbleOther,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  messageText: { fontSize: 14.5, lineHeight: 21 },
  myText: { color: '#FFFFFF', fontWeight: '500' },
  otherText: { color: C.text },

  timeText: { marginTop: 6, fontSize: 10.5, letterSpacing: 0.3 },
  myTime: { color: 'rgba(255,255,255,0.85)', textAlign: 'right' },
  otherTime: { color: C.textDim, textAlign: 'left' },

  // typing
  typingBubble: { paddingVertical: 14, paddingHorizontal: 16 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary },

  // sources
  sourcesWrap: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  sourcesHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  sourcesTitle: {
    fontSize: 10.5,
    color: C.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sourceItem: { marginTop: 2, fontSize: 11.5, color: C.textMuted },

  // error
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 14,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFE4EA',
    borderWidth: 1,
    borderColor: '#FBCFD8',
  },
  errorText: { color: C.danger, fontSize: 12, flex: 1 },

  // composer
  composerWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 26,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: C.shadow,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3EEFF',
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    fontSize: 14.5,
    color: C.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});

export default ChatUI;
