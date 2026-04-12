import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NotificationItemModel } from './notification.types';

type Props = {
  item: NotificationItemModel;
};

export default function NotificationCard({ item }: Props) {
  return (
    <View style={styles.notificationItem}>
      {/* Thumbnail/Icon */}
      <View style={[styles.thumbnail, { backgroundColor: item.bgColor }]}>
        <Feather name={item.iconName || 'bell'} size={24} color={item.iconColor || '#fff'} />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {item.statusText && (
          <Text style={styles.statusText}>{item.statusText}</Text>
        )}

        {item.hasCTA && (
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
            <Text style={styles.ctaText}>DÙNG NGAY</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981', 
    marginTop: 4,
  },
  ctaButton: {
    marginTop: 8,
    backgroundColor: '#3B82F6', 
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
