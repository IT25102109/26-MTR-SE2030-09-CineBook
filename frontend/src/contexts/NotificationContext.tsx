import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Notification, NotificationPreferences } from '@/types';
import {
  getUserNotifications,
  saveNotification,
  markNotificationRead as storeMarkRead,
  markAllNotificationsRead as storeMarkAllRead,
  deleteNotification as storeDeleteNotification,
  getNotificationPreferences,
  saveNotificationPreferences,
} from '@/data/store';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  hasUnread: boolean;
  bellPulse: boolean;
  addNotification: (n: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  preferences: NotificationPreferences | null;
  updatePreferences: (prefs: NotificationPreferences) => void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bellPulse, setBellPulse] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  const refresh = useCallback(() => {
    if (user) {
      setNotifications(getUserNotifications(user.id));
      setPreferences(getNotificationPreferences(user.id));
    } else {
      setNotifications([]);
      setPreferences(null);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
    saveNotification(notification);
    setNotifications(prev => [notification, ...prev]);
    setBellPulse(true);
    setTimeout(() => setBellPulse(false), 3000);
  }, [user]);

  const markRead = useCallback((id: string) => {
    storeMarkRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    if (!user) return;
    storeMarkAllRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [user]);

  const removeNotification = useCallback((id: string) => {
    storeDeleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
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
      refresh,
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
