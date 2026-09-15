import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, BellOff, Filter } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationIcon } from '@/components/notifications/NotificationIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import type { Notification, NotificationType } from '@/types';

const typeLabels: Record<string, string> = {
  booking_confirmation: 'Booking',
  cancellation_refund: 'Refund',
  showtime_reminder: 'Reminder',
  price_alert: 'Price Alert',
  system_announcement: 'System',
  content_update: 'Content',
  low_availability: 'Low Seats',
  new_booking: 'New Booking',
  scheduling_conflict: 'Conflict',
  revenue_milestone: 'Revenue',
  user_registration: 'User',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function NotificationCenterPage() {
  const { notifications, unreadCount, markRead, markAllRead, removeNotification } = useNotifications();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      if (filter !== 'all' && n.type !== filter) return false;
      if (readFilter === 'unread' && n.read) return false;
      if (readFilter === 'read' && !n.read) return false;
      return true;
    });
  }, [notifications, filter, readFilter]);

  const today = filtered.filter(n => isToday(n.createdAt));
  const earlier = filtered.filter(n => !isToday(n.createdAt));

  const filterTypes: NotificationType[] = Array.from(new Set(notifications.map(n => n.type)));

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Bell className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-display mb-4">Sign in to view notifications</h1>
        <Link to="/"><Button>Go Home</Button></Link>
      </div>
    );
  }

  const renderItem = (n: Notification) => (
    <Card
      key={n.id}
      className={`p-4 group hover:bg-cinema-elevated transition-colors animate-fade-in-up ${
        !n.read ? 'border-l-2 border-l-accent-primary' : 'border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-cinema-elevated flex items-center justify-center">
            <NotificationIcon type={n.type} className="w-5 h-5" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-medium ${!n.read ? 'text-text-primary' : 'text-text-secondary'}`}>{n.title}</h3>
              <Badge variant="default" className="text-[10px]">{typeLabels[n.type] || n.type}</Badge>
            </div>
            <span className="text-xs text-text-muted whitespace-nowrap">{timeAgo(n.createdAt)}</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-2">{n.message}</p>
          <div className="flex items-center gap-3">
            {n.link && (
              <Link to={n.link} onClick={() => !n.read && markRead(n.id)} className="text-xs text-accent-primary hover:underline">
                View details →
              </Link>
            )}
            <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              {!n.read && (
                <button onClick={() => markRead(n.id)} className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent-primary transition-colors">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark read
                </button>
              )}
              <button onClick={() => removeNotification(n.id)} className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent-destructive transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Notifications</h1>
          <p className="text-text-secondary">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
          <div className="grid grid-cols-2 gap-3 flex-1">
            <Select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Types</option>
              {filterTypes.map(t => <option key={t} value={t}>{typeLabels[t] || t}</option>)}
            </Select>
            <Select value={readFilter} onChange={e => setReadFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-cinema-elevated flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-7 h-7 text-text-muted" />
          </div>
          <h3 className="text-lg font-display font-medium mb-2">You're all caught up</h3>
          <p className="text-sm text-text-muted">No notifications match your current filters</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {today.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Today</h2>
              <div className="space-y-3">{today.map(renderItem)}</div>
            </section>
          )}
          {earlier.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Earlier</h2>
              <div className="space-y-3">{earlier.map(renderItem)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
