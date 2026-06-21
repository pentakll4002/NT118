import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export type Conversation = {
  id: string;
  partnerId?: number;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  avatar?: string | null;
  isAI?: boolean;
};

type Props = {
  item: Conversation;
  onPress: () => void;
};

const ConversationItem: React.FC<Props> = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.avatarContainer}>
        {item.isAI ? (
          <LinearGradient
            colors={['#7C5CFF', '#FF8FB1']}
            style={styles.aiAvatar}
          >
            <Feather name="zap" size={20} color="#FFFFFF" />
          </LinearGradient>
        ) : (
          <Image 
            source={item.avatar ? { uri: item.avatar } : { uri: `https://i.pravatar.cc/150?u=${item.partnerId || item.id}` }} 
            style={styles.avatar} 
          />
        )}
        {(item.unreadCount ?? 0) > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount! > 9 ? '9+' : item.unreadCount}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, (item.unreadCount ?? 0) > 0 && styles.nameBold]} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={[styles.lastMessage, (item.unreadCount ?? 0) > 0 && styles.lastMessageUnread]} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      
      <Feather name="chevron-right" size={16} color="#A29DBA" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F1F5FF',
  },
  aiAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF8FB1',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 3,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B1530',
    flex: 1,
    marginRight: 8,
  },
  nameBold: {
    fontWeight: '800',
  },
  time: {
    fontSize: 12,
    color: '#A29DBA',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B6486',
  },
  lastMessageUnread: {
    color: '#1B1530',
    fontWeight: '600',
  },
});

export default ConversationItem;
