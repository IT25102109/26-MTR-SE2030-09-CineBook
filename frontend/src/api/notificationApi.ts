import { apiClient } from './client';
import type { Notification } from '@/types';

function normalizeNotification(raw: any): Notification {
  return {
    id: String(raw.id),
    type: raw.type || 'system_announcement',
    title: raw.title || '',
    message: raw.message || '',
    userId: raw.userId != null ? String(raw.userId) : '',
    read: Boolean(raw.read || raw.isRead),
    createdAt: raw.createdAt || new Date().toISOString(),
    link: raw.link || undefined,
    audience: raw.audience || 'all',
    audienceTarget: raw.audienceTarget || undefined,
    createdBy: raw.createdBy != null ? String(raw.createdBy) : undefined,
    status: raw.status || (raw.read ? 'read' : 'sent'),
  };
}

export const notificationApi = {
  async getNotifications(params?: { userId?: string; role?: string; branchId?: string }): Promise<Notification[]> {
    const query = new URLSearchParams();
    if (params?.userId) query.append('userId', params.userId);
    if (params?.role) query.append('role', params.role);
    if (params?.branchId) query.append('branchId', params.branchId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const data = await apiClient<any[]>(`/notifications${qs}`);
    return data.map(normalizeNotification);
  },

  async createNotification(notification: Omit<Notification, 'id'>): Promise<Notification> {
    const data = await apiClient<any>('/notifications', {
      method: 'POST',
      body: JSON.stringify({
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        audience: notification.audience || 'all',
        audienceTarget: notification.audienceTarget,
        createdBy: notification.createdBy,
        status: notification.status || 'sent',
        read: notification.read ?? false,
      }),
    });
    return normalizeNotification(data);
  },

  async markAsRead(id: string): Promise<Notification> {
    const data = await apiClient<any>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
    return normalizeNotification(data);
  },

  async markAllAsRead(userId: string): Promise<void> {
    await apiClient<void>('/notifications/read-all', {
      method: 'PUT',
      body: JSON.stringify({ userId }),
    });
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient<void>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};

