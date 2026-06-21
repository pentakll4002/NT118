import { useEffect, useRef, useCallback, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { apiClient, API_BASE_URL } from './apiClient';
import { getAuthToken } from './authToken';

// ── Backend response shape ──────────────────────────────────────────
export interface BackendNotification {
  id: number;
  type: string;
  title: string;
  message: string | null;
  data: string | null;
  isRead: boolean;
  createdAt: string;
}

// ── API calls ───────────────────────────────────────────────────────
export async function fetchNotifications(unreadOnly = false): Promise<BackendNotification[]> {
  const res = await apiClient.get('/api/notifications', { params: { unreadOnly } });
  const data = res.data?.data || res.data;
  return Array.isArray(data) ? data : [];
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiClient.patch(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch('/api/notifications/read-all');
}

export async function cleanupInvalidNotifications(): Promise<number> {
  const res = await apiClient.delete('/api/notifications/cleanup');
  const data = res.data?.data || res.data;
  return data?.deleted ?? 0;
}

// ── SignalR singleton ────────────────────────────────────────────────
let sharedConnection: signalR.HubConnection | null = null;
let connectionPromise: Promise<signalR.HubConnection | null> | null = null;
let connectionRefCount = 0;
const listeners: Set<(n: BackendNotification) => void> = new Set();

async function ensureConnection(): Promise<signalR.HubConnection | null> {
  if (sharedConnection) return sharedConnection;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    const token = await getAuthToken();
    if (!token) {
      connectionPromise = null;
      return null;
    }

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .configureLogging(signalR.LogLevel.None)
      .withAutomaticReconnect()
      .build();

    conn.on('notification.created', (n: BackendNotification) => {
      listeners.forEach((cb) => cb(n));
    });

    try {
      await conn.start();
      sharedConnection = conn;
      return conn;
    } catch {
      connectionPromise = null;
      return null;
    }
  })();

  return connectionPromise;
}

async function releaseConnection() {
  if (sharedConnection) {
    await sharedConnection.stop();
    sharedConnection = null;
  }
  connectionPromise = null;
}

export function useNotificationSignalR(onNotification?: (n: BackendNotification) => void) {
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    if (!onNotification) return;

    const cb = (n: BackendNotification) => callbackRef.current?.(n);
    listeners.add(cb);
    connectionRefCount++;

    ensureConnection();

    return () => {
      listeners.delete(cb);
      connectionRefCount--;
      if (connectionRefCount <= 0) {
        connectionRefCount = 0;
        releaseConnection();
      }
    };
  }, []);
}

let globalUnreadCount = 0;
const unreadListeners = new Set<(count: number) => void>();

function setGlobalUnreadCount(count: number) {
  globalUnreadCount = Math.max(0, count);
  unreadListeners.forEach(cb => cb(globalUnreadCount));
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(globalUnreadCount);

  useEffect(() => {
    unreadListeners.add(setLocalUnreadCount);
    return () => { unreadListeners.delete(setLocalUnreadCount); };
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications();
      setNotifications(data);
      setGlobalUnreadCount(data.filter((n) => !n.isRead).length);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await fetchNotifications(true);
      setGlobalUnreadCount(data.length);
    } catch {
      // silent
    }
  }, []);

  const handleRealtimeNotification = useCallback((n: BackendNotification) => {
    setNotifications((prev) => [n, ...prev]);
    setGlobalUnreadCount(globalUnreadCount + 1);
  }, []);

  const markRead = useCallback(async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setGlobalUnreadCount(globalUnreadCount - 1);
    } catch {
      // silent
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setGlobalUnreadCount(0);
    } catch {
      // silent
    }
  }, []);

  return {
    notifications,
    loading,
    unreadCount,
    load,
    loadUnreadCount,
    handleRealtimeNotification,
    markRead,
    markAllRead,
  };
}

export function useSignalREventListener<T>(eventName: string, callback: (data: T) => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    let isMounted = true;
    const cb = (data: T) => {
      if (isMounted) callbackRef.current?.(data);
    };

    const register = async () => {
      await ensureConnection();
      if (!isMounted || !sharedConnection) return;
      sharedConnection.on(eventName, cb);
    };

    register();

    return () => {
      isMounted = false;
      if (sharedConnection) {
        sharedConnection.off(eventName, cb);
      }
    };
  }, [eventName]);
}
