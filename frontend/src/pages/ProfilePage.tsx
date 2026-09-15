import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield, Film, Ticket, LogOut, ChevronRight, Bell, ToggleLeft, ToggleRight, BellRing, Clock, Tag, Megaphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { getUserBookings } from '@/data/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { NotificationPreferences } from '@/types';

const roleLabels = {
  customer: 'Customer',
  cinemaManager: 'Cinema Manager',
  admin: 'Admin',
};

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { preferences, updatePreferences } = useNotifications();

  const bookings = useMemo(() => user ? getUserBookings(user.id) : [], [user]);
  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.date) >= new Date(new Date().toDateString()));
  const totalSpent = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0);

  const [prefs, setPrefs] = useState<NotificationPreferences | null>(preferences);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">Sign in to view your profile</h1>
        <Link to="/"><Button>Go Home</Button></Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast('info', 'Signed out');
  };

  const togglePref = (key: keyof NotificationPreferences) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    updatePreferences(updated);
    toast('success', 'Notification preferences updated');
  };

  const prefItems: { key: keyof NotificationPreferences; label: string; icon: typeof Bell; desc: string }[] = [
    { key: 'email', label: 'Email Notifications', icon: Mail, desc: 'Receive notifications via email' },
    { key: 'push', label: 'Push Notifications', icon: BellRing, desc: 'Receive push notifications in-app' },
    { key: 'booking_confirmation', label: 'Booking Confirmations', icon: Ticket, desc: 'When a booking is confirmed' },
    { key: 'showtime_reminder', label: 'Showtime Reminders', icon: Clock, desc: 'Reminders before your showtime' },
    { key: 'price_alert', label: 'Price Alerts', icon: Tag, desc: 'Price drops and promotions' },
    { key: 'system_announcement', label: 'System Announcements', icon: Megaphone, desc: 'Platform-wide broadcasts' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display font-bold mb-8">Profile</h1>

      <Card className="p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-5 mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-black"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-display font-bold">{user.name}</h2>
            <p className="text-sm text-text-secondary flex items-center gap-1.5 mt-1">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
            <div className="mt-2">
              <Badge variant="amber"><Shield className="w-3 h-3" /> {roleLabels[user.role]}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/5">
          <div className="text-center p-4 rounded-xl bg-cinema-elevated">
            <Ticket className="w-5 h-5 text-accent-primary mx-auto mb-2" />
            <p className="text-2xl font-display font-bold">{bookings.length}</p>
            <p className="text-xs text-text-muted">Total Bookings</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-cinema-elevated">
            <Film className="w-5 h-5 text-accent-primary mx-auto mb-2" />
            <p className="text-2xl font-display font-bold">{upcoming.length}</p>
            <p className="text-xs text-text-muted">Upcoming</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-cinema-elevated">
            <span className="text-2xl block mb-2">$</span>
            <p className="text-2xl font-display font-bold">{totalSpent.toFixed(0)}</p>
            <p className="text-xs text-text-muted">Total Spent</p>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      {prefs && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-5 h-5 text-accent-primary" />
            <h2 className="font-display font-semibold text-lg">Notification Preferences</h2>
          </div>
          <div className="space-y-1">
            {prefItems.map((item, i) => (
              <div key={item.key} className={`flex items-center justify-between p-3 rounded-xl hover:bg-cinema-elevated transition-colors ${i < 2 ? 'border-b border-white/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cinema-elevated flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-text-muted">{item.desc}</p>
                  </div>
                </div>
                <button onClick={() => togglePref(item.key)} className="flex-shrink-0">
                  {prefs[item.key] ? (
                    <ToggleRight className="w-8 h-8 text-accent-primary" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-text-muted" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <Link to="/bookings" className="flex items-center justify-between p-5 hover:bg-cinema-elevated transition-colors group">
          <div className="flex items-center gap-3">
            <Ticket className="w-5 h-5 text-text-secondary" />
            <span className="text-sm font-medium">My Bookings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-primary transition-colors" />
        </Link>
        <div className="border-t border-white/5" />
        <Link to="/notifications" className="flex items-center justify-between p-5 hover:bg-cinema-elevated transition-colors group">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-text-secondary" />
            <span className="text-sm font-medium">Notifications</span>
          </div>
          <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-primary transition-colors" />
        </Link>
        <div className="border-t border-white/5" />
        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-5 hover:bg-cinema-elevated transition-colors text-accent-destructive">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </Card>
    </div>
  );
}
