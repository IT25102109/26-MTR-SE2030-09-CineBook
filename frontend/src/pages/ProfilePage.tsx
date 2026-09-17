import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield, Film, Ticket, LogOut, ChevronRight, Bell, ToggleLeft, ToggleRight, BellRing, Clock, Tag, Megaphone, Crown, Award, Gift, Sparkles, Check, Copy, ArrowRight, CheckCircle2, Calendar, BarChart3, Building2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { getUserBookings, getUserLoyaltyVouchers, redeemLoyaltyReward, calculateLoyaltyTier } from '@/data/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { NotificationPreferences, LoyaltyVoucher } from '@/types';

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
  const [tick, setTick] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loyaltyPoints = user?.loyaltyPoints ?? 0;
  const currentTier = user?.loyaltyTier || calculateLoyaltyTier(loyaltyPoints);
  const vouchers = useMemo(() => user ? getUserLoyaltyVouchers(user.id) : [], [user, tick]);

  const tierProgress = useMemo(() => {
    if (currentTier === 'Platinum') {
      return { pct: 100, nextTier: null, ptsNeeded: 0, min: 1200, max: 1200 };
    }
    if (currentTier === 'Gold') {
      const min = 700;
      const max = 1200;
      const pct = Math.min(100, Math.round(((loyaltyPoints - min) / (max - min)) * 100));
      return { pct, nextTier: 'Platinum', ptsNeeded: max - loyaltyPoints, min, max };
    }
    if (currentTier === 'Silver') {
      const min = 300;
      const max = 700;
      const pct = Math.min(100, Math.round(((loyaltyPoints - min) / (max - min)) * 100));
      return { pct, nextTier: 'Gold', ptsNeeded: max - loyaltyPoints, min, max };
    }
    const min = 0;
    const max = 300;
    const pct = Math.min(100, Math.round((loyaltyPoints / max) * 100));
    return { pct, nextTier: 'Silver', ptsNeeded: max - loyaltyPoints, min, max };
  }, [currentTier, loyaltyPoints]);

  const rewards = [
    { id: 'r1', title: 'Large Fountain Beverage', cost: 150, icon: '🥤', desc: 'Any soft drink or zero-sugar beverage' },
    { id: 'r2', title: 'Large Butter Popcorn', cost: 250, icon: '🍿', desc: 'Warm freshly popped corn with gourmet butter' },
    { id: 'r3', title: '$10 Movie / Snack Voucher', cost: 500, icon: '🎟️', desc: 'Instant $10 discount at checkout or snack bar' },
    { id: 'r4', title: '1 Free Movie Ticket', cost: 1000, icon: '🎬', desc: 'Complimentary pass for any 2D cinema screening' },
  ];

  const tierBenefits: Record<string, string[]> = {
    Bronze: ['1x Points on ticket purchases', 'Birthday movie ticket discount', 'Standard seat reservations'],
    Silver: ['1.25x CinePoints multiplier', '10% food & beverage discount', 'Free regular popcorn on qualification'],
    Gold: ['1.5x CinePoints multiplier', '15% food & beverage discount', '24h Early booking window for blockbusters', 'Free combo snack voucher'],
    Platinum: ['2.0x CinePoints multiplier', '20% discount on all tickets & snacks', 'Complimentary VIP Lounge access', 'Dedicated concierge booking support', '1 Free seasonal movie pass'],
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast('success', `Copied voucher code: ${code}`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleRedeem = (title: string, cost: number) => {
    if (!user) return;
    const res = redeemLoyaltyReward(user.id, title, cost);
    if (res.success) {
      toast('success', res.message);
      setTick(t => t + 1);
    } else {
      toast('error', res.message);
    }
  };

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
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="amber"><Shield className="w-3 h-3" /> {roleLabels[user.role]}</Badge>
              {user.role === 'customer' && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  currentTier === 'Platinum'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : currentTier === 'Gold'
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                    : currentTier === 'Silver'
                    ? 'bg-slate-400/20 text-slate-300 border-slate-500/40'
                    : 'bg-amber-900/30 text-amber-500 border-amber-800/40'
                }`}>
                  <Crown className="w-3 h-3" /> {currentTier} VIP
                </span>
              )}
            </div>
          </div>
        </div>

        {user.role === 'customer' && (
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
              <span className="text-2xl block mb-2 font-display text-accent-primary">$</span>
              <p className="text-2xl font-display font-bold">{totalSpent.toFixed(0)}</p>
              <p className="text-xs text-text-muted">Total Spent</p>
            </div>
          </div>
        )}
      </Card>

      {/* Customer Loyalty Points & Tier Progression System (Member 6: IT25101952) */}
      {user.role === 'customer' && (
        <Card className="p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              currentTier === 'Platinum'
                ? 'bg-purple-500/20 text-purple-400'
                : currentTier === 'Gold'
                ? 'bg-amber-400/20 text-amber-300'
                : currentTier === 'Silver'
                ? 'bg-slate-400/20 text-slate-300'
                : 'bg-amber-900/30 text-amber-500'
            }`}>
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-bold">CineClub Loyalty</h2>
                <Badge variant={currentTier === 'Platinum' || currentTier === 'Gold' ? 'amber' : currentTier === 'Silver' ? 'blue' : 'default'}>
                  {currentTier} Tier
                </Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">Earn CinePoints on every ticket & concession purchase</p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-cinema-elevated sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <div className="text-3xl font-display font-extrabold text-accent-primary flex items-baseline sm:justify-end gap-1">
              <span>{loyaltyPoints}</span>
              <span className="text-xs text-text-muted font-normal uppercase tracking-wider">pts</span>
            </div>
            <p className="text-xs text-text-secondary">Available balance</p>
          </div>
        </div>

        {/* Tier Progression Progress Bar */}
        <div className="p-4 rounded-xl bg-cinema-elevated border border-white/5 mb-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-text-secondary">
              Tier Progress: <strong className="text-text-primary">{currentTier}</strong>
            </span>
            <span className="font-semibold text-accent-primary">
              {tierProgress.nextTier ? `${tierProgress.ptsNeeded} pts to ${tierProgress.nextTier}` : 'Top Tier Achieved!'}
            </span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                currentTier === 'Platinum'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : currentTier === 'Gold'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                  : currentTier === 'Silver'
                  ? 'bg-gradient-to-r from-slate-400 to-blue-400'
                  : 'bg-gradient-to-r from-amber-700 to-amber-500'
              }`}
              style={{ width: `${Math.max(8, tierProgress.pct)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-text-muted mt-1.5 font-mono">
            <span>Bronze (0)</span>
            <span>Silver (300)</span>
            <span>Gold (700)</span>
            <span>Platinum (1,200+)</span>
          </div>
        </div>

        {/* Current Tier Perks */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-primary" /> Active {currentTier} VIP Benefits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {tierBenefits[currentTier]?.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-text-secondary p-2.5 rounded-lg bg-cinema-elevated/60 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Redeemable Rewards Catalog */}
        <div className="border-t border-white/5 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Gift className="w-4 h-4 text-accent-primary" /> Redeem Loyalty Rewards
              </h3>
              <p className="text-xs text-text-muted">Use points to unlock instant vouchers for cinema perks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rewards.map(r => {
              const canAfford = loyaltyPoints >= r.cost;
              return (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-cinema-elevated border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <h4 className="text-xs font-semibold text-text-primary">{r.title}</h4>
                      <p className="text-[11px] text-text-muted line-clamp-1">{r.desc}</p>
                      <span className="inline-block text-[11px] font-bold text-accent-primary mt-1">
                        {r.cost} pts
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={canAfford ? 'primary' : 'secondary'}
                    disabled={!canAfford}
                    onClick={() => handleRedeem(r.title, r.cost)}
                    className="flex-shrink-0 text-xs py-1 px-3"
                  >
                    {canAfford ? 'Redeem' : `Need ${r.cost - loyaltyPoints} pts`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Active Vouchers Wallet */}
        {vouchers.length > 0 && (
          <div className="border-t border-white/5 pt-6 mt-6">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
              <Ticket className="w-4 h-4 text-accent-primary" /> My Redeemed Vouchers ({vouchers.length})
            </h3>
            <div className="space-y-2">
              {vouchers.map(v => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-accent-primary/5 border border-accent-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary">{v.title}</span>
                      <Badge variant="green">Active</Badge>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Valid until {new Date(v.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="px-2.5 py-1 rounded bg-black/60 font-mono font-bold text-accent-primary tracking-wider text-xs border border-white/10">
                      {v.code}
                    </code>
                    <button
                      onClick={() => handleCopyCode(v.code)}
                      className="p-1.5 rounded-lg bg-cinema-elevated hover:bg-cinema-border/50 text-text-secondary hover:text-text-primary transition-colors"
                      title="Copy code"
                    >
                      {copiedCode === v.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      )}

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
        {user.role === 'customer' && (
          <>
            <Link to="/bookings" className="flex items-center justify-between p-5 hover:bg-cinema-elevated transition-colors group">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-text-secondary" />
                <span className="text-sm font-medium">My Bookings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-primary transition-colors" />
            </Link>
            <div className="border-t border-white/5" />
          </>
        )}

        {user.role === 'cinemaManager' && (
          <>
            <Link to="/manage/movies" className="flex items-center justify-between p-5 hover:bg-cinema-elevated transition-colors group">
              <div className="flex items-center gap-3">
                <Film className="w-5 h-5 text-text-secondary" />
                <span className="text-sm font-medium">Manage Movies</span>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-primary transition-colors" />
            </Link>
            <div className="border-t border-white/5" />
            <Link to="/manage/showtimes" className="flex items-center justify-between p-5 hover:bg-cinema-elevated transition-colors group">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-text-secondary" />
                <span className="text-sm font-medium">Manage Showtimes</span>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-primary transition-colors" />
            </Link>
            <div className="border-t border-white/5" />
          </>
        )}

        {user.role === 'admin' && (
          <>
            <Link to="/admin/analytics" className="flex items-center justify-between p-5 hover:bg-cinema-elevated transition-colors group">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-text-secondary" />
                <span className="text-sm font-medium">Analytics & Reports</span>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-primary transition-colors" />
            </Link>
            <div className="border-t border-white/5" />
            <Link to="/manage/movies" className="flex items-center justify-between p-5 hover:bg-cinema-elevated transition-colors group">
              <div className="flex items-center gap-3">
                <Film className="w-5 h-5 text-text-secondary" />
                <span className="text-sm font-medium">Manage Movies</span>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-primary transition-colors" />
            </Link>
            <div className="border-t border-white/5" />
            <Link to="/manage/showtimes" className="flex items-center justify-between p-5 hover:bg-cinema-elevated transition-colors group">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-text-secondary" />
                <span className="text-sm font-medium">Manage Showtimes</span>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-primary transition-colors" />
            </Link>
            <div className="border-t border-white/5" />
            <Link to="/admin/branches" className="flex items-center justify-between p-5 hover:bg-cinema-elevated transition-colors group">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-text-secondary" />
                <span className="text-sm font-medium">Cinema Branches</span>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-primary transition-colors" />
            </Link>
            <div className="border-t border-white/5" />
            <Link to="/admin/users" className="flex items-center justify-between p-5 hover:bg-cinema-elevated transition-colors group">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-text-secondary" />
                <span className="text-sm font-medium">User Management</span>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-primary transition-colors" />
            </Link>
            <div className="border-t border-white/5" />
          </>
        )}

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
