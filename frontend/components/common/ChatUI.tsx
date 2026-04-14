import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  initialMessages?: ChatMessage[];
  onBackPress?: () => void;
};

const defaultMessages: ChatMessage[] = [
  { id: '1', text: 'Xin chào, tôi có thể hỗ trợ gì cho bạn?', sender: 'other', time: '09:15' },
];

const ChatUI: React.FC<ChatUIProps> = ({ title = 'Tin nhắn', initialMessages = defaultMessages, onBackPress }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sortedMessages = useMemo(() => messages, [messages]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || isSending) {
      return;
    }

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
      const conversationHistory = sortedMessages.map((message) => ({
        role: message.sender === 'me' ? 'user' as const : 'assistant' as const,
        content: message.text,
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
      const fallback = 'Khong ket noi duoc chatbot. Kiem tra server ai-agentic va thu lai.';
      const message = error instanceof Error && error.message
        ? error.message
        : fallback;
      setErrorMessage(message);
    } finally {
      clearTimeout(timeoutId);
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.iconButton} />
      </View>

      <FlatList
        data={sortedMessages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[styles.messageRow, item.sender === 'me' ? styles.myRow : styles.otherRow]}>
            <View style={[styles.bubble, item.sender === 'me' ? styles.myBubble : styles.otherBubble]}>
              <Text style={[styles.messageText, item.sender === 'me' ? styles.myText : styles.otherText]}>{item.text}</Text>
              {item.sender === 'other' && item.sources && item.sources.length > 0 ? (
                <View style={styles.sourcesWrap}>
                  <Text style={styles.sourcesTitle}>Sources:</Text>
                  {item.sources.slice(0, 3).map((source, index) => (
                    <Text key={`${item.id}-source-${index}`} style={styles.sourceItem}>
                      - {source}
                    </Text>
                  ))}
                </View>
              ) : null}
              <Text style={[styles.timeText, item.sender === 'me' ? styles.myTime : styles.otherTime]}>{item.time}</Text>
            </View>
          </View>
        )}
      />
      {isSending ? (
        <View style={[styles.messageRow, styles.otherRow, styles.typingRow]}>
          <View style={[styles.bubble, styles.otherBubble]}>
            <Text style={styles.typingText}>Bot dang tra loi...</Text>
          </View>
        </View>
      ) : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.inputContainer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Nhap tin nhan..."
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity onPress={handleSend} style={[styles.sendButton, isSending && styles.sendButtonDisabled]} disabled={isSending}>
          <Feather name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Montserrat_700Bold',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  messageRow: {
    flexDirection: 'row',
  },
  myRow: {
    justifyContent: 'flex-end',
  },
  otherRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#111827',
  },
  timeText: {
    marginTop: 4,
    fontSize: 11,
  },
  myTime: {
    color: '#DBEAFE',
    textAlign: 'right',
  },
  otherTime: {
    color: '#6B7280',
    textAlign: 'left',
  },
  typingRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingText: {
    color: '#6B7280',
    fontStyle: 'italic',
    fontSize: 13,
  },
  sourcesWrap: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 6,
  },
  sourcesTitle: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  sourceItem: {
    marginTop: 2,
    fontSize: 11,
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});

export default ChatUI;
