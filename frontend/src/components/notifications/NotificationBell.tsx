import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, BellOff } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationIcon } from '@/components/notifications/NotificationIcon';
import type { Notification } from '@/types';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const { notifications, unreadCount, hasUnread, bellPulse, markRead, markAllRead, removeNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const recent = notifications.slice(0, 6);

  const handleItemClick = (n: Notification) => {
    if (!n.read) markRead(n.id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-lg hover:bg-white/5 transition-colors ${bellPulse ? 'animate-pulse-glow' : ''}`}
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${hasUnread ? 'text-accent-primary' : 'text-text-secondary'} hover:text-text-primary transition-colors`} />
        {hasUnread && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent-primary text-black text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-cinema-elevated/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-soft-xl overflow-hidden z-50 animate-slide-down">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent-primary" />
              <h3 className="font-display font-semibold text-sm">Notifications</h3>
              {hasUnread && (
                <span className="text-xs text-text-muted">{unreadCount} unread</span>
              )}
            </div>
            {hasUnread && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent-primary transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recent.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-14 h-14 rounded-full bg-cinema-card flex items-center justify-center mx-auto mb-3">
                  <BellOff className="w-6 h-6 text-text-muted" />
                </div>
                <p className="text-sm font-medium text-text-secondary">You're all caught up</p>
                <p className="text-xs text-text-muted mt-1">No new notifications right now</p>
              </div>
            ) : (
              recent.map(n => (
                <div
                  key={n.id}
                  className={`group flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                    !n.read ? 'border-l-2 border-l-accent-primary' : 'border-l-2 border-l-transparent'
                  }`}
                  onClick={() => handleItemClick(n)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-lg bg-cinema-card flex items-center justify-center">
                      <NotificationIcon type={n.type} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${!n.read ? 'text-text-primary' : 'text-text-secondary'}`}>{n.title}</p>
                      <span className="text-[10px] text-text-muted whitespace-nowrap flex-shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                          className="text-[10px] text-text-secondary hover:text-accent-primary transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                        className="text-[10px] text-text-secondary hover:text-accent-destructive transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/5">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs text-accent-primary hover:text-accent-primary-hover transition-colors font-medium"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
