import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { Notification, NotificationPreferences } from '@/types';
import {
  getUserNotifications,
  saveNotification,
  markNotificationRead as storeMarkRead,
  markAllNotificationsRead as storeMarkAllRead,
  deleteNotification as storeDeleteNotification,
  getNotificationPreferences,
  saveNotificationPreferences,
  getNotifications,
  emitStoreEvent,
  STORE_EVENTS,
} from '@/data/store';
import { notificationApi } from '@/api/notificationApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  hasUnread: boolean;
  bellPulse: boolean;
  addNotification: (n: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  preferences: NotificationPreferences | null;
  updatePreferences: (prefs: NotificationPreferences) => void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bellPulse, setBellPulse] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  // Track known notification IDs to only trigger real-time toasts on brand new incoming items
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isInitialSyncRef = useRef<boolean>(true);

  const refreshFromStore = useCallback(() => {
    if (user) {
      const userList = getUserNotifications(user.id);
      setNotifications(userList);
      setPreferences(getNotificationPreferences(user.id));
      userList.forEach(n => knownIdsRef.current.add(n.id));
    } else {
      const guestNotifs = getUserNotifications('');
      setNotifications(guestNotifs);
      setPreferences(null);
      guestNotifs.forEach(n => knownIdsRef.current.add(n.id));
    }
  }, [user]);

  // Fast background sync with backend API across users
  const syncWithApi = useCallback(async (isInitial = false) => {
    try {
      const params = user
        ? { userId: user.id, role: user.role, branchId: user.assignedBranchId }
        : undefined;

      const serverNotifs = await notificationApi.getNotifications(params);

      if (serverNotifs && serverNotifs.length > 0) {
        const curAll = getNotifications();
        const merged = [...curAll];
        let hasNewArrival = false;
        let newestNotif: Notification | null = null;

        serverNotifs.forEach(sn => {
          const idx = merged.findIndex(n => n.id === sn.id);
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...sn };
          } else {
            merged.unshift(sn);
            // If this is an unread notification that we haven't seen before and it's not the initial mount
            if (!isInitial && !sn.read && !knownIdsRef.current.has(sn.id)) {
              hasNewArrival = true;
              if (!newestNotif) newestNotif = sn;
            }
          }
          knownIdsRef.current.add(sn.id);
        });

        localStorage.setItem('cinebook_notifications', JSON.stringify(merged));
        emitStoreEvent(STORE_EVENTS.notifications);

        if (hasNewArrival && newestNotif) {
          setBellPulse(true);
          setTimeout(() => setBellPulse(false), 3500);
          toast('info', `${(newestNotif as Notification).title}: ${(newestNotif as Notification).message}`);
        }
      }
    } catch {
      // Offline / network fallback silently uses local store
    }
  }, [user, toast]);

  // Local storage & store updates
  useEffect(() => {
    refreshFromStore();
    const handleSync = () => {
      refreshFromStore();
    };
    window.addEventListener(STORE_EVENTS.notifications, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(STORE_EVENTS.notifications, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [refreshFromStore]);

  // Real-time polling and window focus synchronization
  useEffect(() => {
    // Initial sync
    syncWithApi(true).finally(() => {
      isInitialSyncRef.current = false;
    });

    // Active polling interval: 4s when active, 15s when hidden
    let intervalId: any = null;

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      const intervalMs = document.hidden ? 15000 : 4000;
      intervalId = setInterval(() => {
        syncWithApi(false);
      }, intervalMs);
    };

    startPolling();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Immediate sync upon returning to tab
        syncWithApi(false);
      }
      startPolling();
    };

    const handleWindowFocus = () => {
      syncWithApi(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [syncWithApi]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>) => {
    if (!user) return;
    const notification: Notification = {
      ...n,
      id: `n${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      read: false,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
    knownIdsRef.current.add(notification.id);
    saveNotification(notification);
    setNotifications(prev => [notification, ...prev]);
    setBellPulse(true);
    setTimeout(() => setBellPulse(false), 3000);
  }, [user]);

  const markRead = useCallback(async (id: string) => {
    storeMarkRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, status: 'read' } : n));
    try {
      await notificationApi.markAsRead(id);
    } catch (err) {
      console.warn('API markAsRead error:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    storeMarkAllRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true, status: 'read' })));
    try {
      await notificationApi.markAllAsRead(user.id);
    } catch (err) {
      console.warn('API markAllAsRead error:', err);
    }
  }, [user]);

  const removeNotification = useCallback(async (id: string) => {
    storeDeleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await notificationApi.deleteNotification(id);
    } catch (err) {
      console.warn('API deleteNotification error:', err);
    }
  }, []);

  const updatePreferences = useCallback((prefs: NotificationPreferences) => {
    if (!user) return;
    saveNotificationPreferences(user.id, prefs);
    setPreferences(prefs);
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      hasUnread,
      bellPulse,
      addNotification,
      markRead,
      markAllRead,
      removeNotification,
      preferences,
      updatePreferences,
      refresh: refreshFromStore,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
