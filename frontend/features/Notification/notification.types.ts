import { Feather } from '@expo/vector-icons';

export type NotificationType = 'ORDER' | 'PROMO' | 'NEWS' | 'SYSTEM';

export interface NotificationItemModel {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  isOlder: boolean;
  statusText?: string;
  hasCTA?: boolean;
  iconName?: keyof typeof Feather.glyphMap;
  iconColor?: string;
  bgColor?: string;
}

export interface TabModel {
  id: NotificationType | 'ALL';
  label: string;
}
