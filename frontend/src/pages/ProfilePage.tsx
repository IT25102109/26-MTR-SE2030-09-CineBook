import { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, RotateCcw, LogOut } from 'lucide-react';
import { useAuth, ROLE_LABELS } from '@/context/AuthContext';
import { store, resetData } from '@/data/store';
import type { Booking } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';

export function ProfilePage() {
  const { user, role, setRole } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setBookings(store.getBookings().filter((b) => b.userId === user.id));
  }, [user.id]);

  const totalSpent = bookings.filter((b) => b.status === 'confirmed').reduce((s, b) => s + b.total, 0);
  const totalTickets = bookings.filter((b) => b.status === 'confirmed').reduce((s, b) => s + b.seats.length, 0);

  const roleColor: Record<string, string> = {
    customer: 'text-success',
    manager: 'text-gold',
    admin: 'text-accent',
  };

  return (
    <div className="container-app py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      {/* Profile card */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-ink-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1"><Mail className="w-4 h-4" /> {user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
              <Shield className={`w-4 h-4 ${roleColor[role]}`} />
              <span className={`font-medium ${roleColor[role]}`}>{ROLE_LABELS[role]}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <div className="text-2xl font-bold text-accent">{bookings.length}</div>
          <div className="text-xs text-ink-400 mt-1">Total Bookings</div>
        </Card>
        <Card className="p-5">
          <div className="text-2xl font-bold text-success">${totalSpent.toFixed(2)}</div>
          <div className="text-xs text-ink-400 mt-1">Total Spent</div>
        </Card>
        <Card className="p-5">
          <div className="text-2xl font-bold text-gold">{totalTickets}</div>
          <div className="text-xs text-ink-400 mt-1">Tickets Bought</div>
        </Card>
        <Card className="p-5">
          <div className="text-2xl font-bold text-blue-400">{bookings.filter((b) => b.status === 'cancelled').length}</div>
          <div className="text-xs text-ink-400 mt-1">Cancelled</div>
        </Card>
      </div>

      {/* Settings */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-ink-300 mb-2 block">Switch Role (Demo)</label>
            <Select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
              <option value="customer">Customer</option>
              <option value="manager">Cinema Manager</option>
              <option value="admin">Admin</option>
            </Select>
            <p className="text-xs text-ink-400 mt-2">Change your role to see different views and access levels.</p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <Button variant="outline" onClick={() => { resetData(); window.location.reload(); }}>
              <RotateCcw className="w-4 h-4" /> Reset Demo Data
            </Button>
            <p className="text-xs text-ink-400 mt-2">This restores all movies, showtimes, and bookings to their original state.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
