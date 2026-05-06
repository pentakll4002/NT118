import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { apiClient, API_BASE_URL } from './apiClient';
import { getAuthToken } from './authToken';

const USE_MOCK = false;

// ── Types ────────────────────────────────────────────────────────────

export interface ConversationDTO {
  partnerId: number;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string | null;
  lastMessageTime: string;
  unreadCount: number;
}

export interface MessageDTO {
  id: number;
  senderId: number;
  receiverId: number;
  orderId: number | null;
  messageType: string;
  content: string | null;
  attachmentUrl: string | null;
  isRead: boolean;
  sentAt: string;
}

export interface SendMessagePayload {
  receiverId: number;
  content: string;
  orderId?: number;
  attachmentUrl?: string;
  messageType?: string;
}

export interface RealtimeMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string | null;
  messageType: string;
  attachmentUrl: string | null;
  sentAt: string;
}

// ── API Calls ────────────────────────────────────────────────────────

/** Get list of conversations for current user */
export async function getConversations(): Promise<ConversationDTO[]> {

  const res = await apiClient.get('/api/messages/conversations');
  const data = res.data?.data || res.data;
  return Array.isArray(data) ? data : [];
}

/** Get messages between current user and a partner */
export async function getMessages(receiverId: number, limit = 100): Promise<MessageDTO[]> {

  const res = await apiClient.get('/api/messages', {
    params: { receiverId, limit },
  });
  const data = res.data?.data || res.data;
  return Array.isArray(data) ? data : [];
}

/** Send a message */
export async function sendMessage(payload: SendMessagePayload): Promise<{ messageId: number }> {
  const res = await apiClient.post('/api/messages', {
    receiverId: payload.receiverId,
    content: payload.content,
    orderId: payload.orderId ?? null,
    attachmentUrl: payload.attachmentUrl ?? null,
    messageType: payload.messageType ?? 'text',
  });
  return res.data?.data || res.data;
}

/** Mark all messages from a partner as read */
export async function markConversationRead(receiverId: number): Promise<void> {
  await apiClient.patch(`/api/messages/${receiverId}/read`);
}

// ── SignalR Real-time Hook ───────────────────────────────────────────

let chatConnection: signalR.HubConnection | null = null;
let chatRefCount = 0;
const chatListeners: Set<(msg: RealtimeMessage) => void> = new Set();

async function ensureChatConnection() {
  if (chatConnection) return;

  const token = await getAuthToken();
  if (!token) return;

  const conn = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/notifications`, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build();

  conn.on('message.received', (msg: RealtimeMessage) => {
    chatListeners.forEach((cb) => cb(msg));
  });

  try {
    await conn.start();
    chatConnection = conn;
  } catch (e) {
    console.log('Chat SignalR connection failed:', e);
  }
}

async function releaseChatConnection() {
  if (chatConnection) {
    await chatConnection.stop();
    chatConnection = null;
  }
}

/**
 * Hook to listen for real-time incoming messages via SignalR.
 * The callback receives a RealtimeMessage whenever another user sends
 * a message to the currently logged-in user.
 */
export function useChatSignalR(onNewMessage?: (msg: RealtimeMessage) => void) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    if (!onNewMessage) return;

    const cb = (msg: RealtimeMessage) => callbackRef.current?.(msg);
    chatListeners.add(cb);
    chatRefCount++;

    ensureChatConnection();

    return () => {
      chatListeners.delete(cb);
      chatRefCount--;
      if (chatRefCount <= 0) {
        chatRefCount = 0;
        releaseChatConnection();
      }
    };
  }, []);
}
