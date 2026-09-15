import {
  Ticket, RotateCcw, Clock, Tag, Megaphone, Film, AlertTriangle,
  Calendar, TrendingUp, UserPlus, Bell, type LucideIcon,
} from 'lucide-react';
import type { NotificationType } from '@/types';

const iconMap: Record<NotificationType, LucideIcon> = {
  booking_confirmation: Ticket,
  cancellation_refund: RotateCcw,
  showtime_reminder: Clock,
  price_alert: Tag,
  system_announcement: Megaphone,
  content_update: Film,
  low_availability: AlertTriangle,
  new_booking: Calendar,
  scheduling_conflict: AlertTriangle,
  revenue_milestone: TrendingUp,
  user_registration: UserPlus,
};

const colorMap: Record<NotificationType, string> = {
  booking_confirmation: '#10B981',
  cancellation_refund: '#E50914',
  showtime_reminder: '#F5C518',
  price_alert: '#F97316',
  system_announcement: '#3B82F6',
  content_update: '#8B5CF6',
  low_availability: '#E50914',
  new_booking: '#10B981',
  scheduling_conflict: '#F97316',
  revenue_milestone: '#F5C518',
  user_registration: '#06B6D4',
};

export function NotificationIcon({ type, className = 'w-4 h-4' }: { type: NotificationType; className?: string }) {
  const Icon = iconMap[type] || Bell;
  const color = colorMap[type] || '#8A8A94';
  return <Icon className={className} style={{ color }} />;
}

export function getNotificationColor(type: NotificationType): string {
  return colorMap[type] || '#8A8A94';
}
