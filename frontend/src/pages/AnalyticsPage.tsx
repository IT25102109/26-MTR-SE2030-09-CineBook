import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { DollarSign, Ticket, Users, TrendingUp, Film, Building2 } from 'lucide-react';
import { store } from '@/data/store';
import type { Booking, Movie, CinemaBranch, AppUser } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const COLORS = ['#E50914', '#F5C518', '#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ec4899'];

export function AnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [branches, setBranches] = useState<CinemaBranch[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    setBookings(store.getBookings());
    setMovies(store.getMovies());
    setBranches(store.getBranches());
    setUsers(store.getUsers());
  }, []);

  const confirmed = useMemo(() => bookings.filter((b) => b.status === 'confirmed'), [bookings]);

  const totalRevenue = useMemo(() => confirmed.reduce((sum, b) => sum + b.total, 0), [confirmed]);
  const totalBookings = confirmed.length;
  const totalSeats = useMemo(() => confirmed.reduce((sum, b) => sum + b.seats.length, 0), [confirmed]);
  const activeUsers = users.filter((u) => u.status === 'active').length;

  // Revenue by branch
  const branchRevenue = useMemo(() => {
    return branches.map((b) => {
      const rev = confirmed.filter((bk) => bk.branchId === b.id).reduce((s, bk) => s + bk.total, 0);
      const count = confirmed.filter((bk) => bk.branchId === b.id).length;
      return { name: b.city, revenue: Math.round(rev), bookings: count };
    });
  }, [branches, confirmed]);

  // Revenue trend (last 7 days mock)
  const revenueTrend = useMemo(() => {
    const days: { day: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayBookings = confirmed.filter((b) => new Date(b.bookedAt).toDateString() === d.toDateString());
      const rev = dayBookings.reduce((s, b) => s + b.total, 0);
      // Add some mock baseline so chart isn't empty
      days.push({ day: label, revenue: Math.round(rev + 200 + Math.random() * 800) });
    }
    return days;
  }, [confirmed]);

  // Top movies by bookings
  const topMovies = useMemo(() => {
    const counts: Record<string, number> = {};
    confirmed.forEach((b) => { counts[b.movieId] = (counts[b.movieId] ?? 0) + b.seats.length; });
    return Object.entries(counts)
      .map(([id, count]) => ({ name: movies.find((m) => m.id === id)?.title ?? 'Unknown', seats: count }))
      .sort((a, b) => b.seats - a.seats)
      .slice(0, 5);
  }, [confirmed, movies]);

  // Genre distribution
  const genreData = useMemo(() => {
    const counts: Record<string, number> = {};
    confirmed.forEach((b) => {
      const m = movies.find((mv) => mv.id === b.movieId);
      m?.genres.forEach((g) => { counts[g] = (counts[g] ?? 0) + 1; });
    });
    // Fallback mock data if no bookings
    if (Object.keys(counts).length === 0) {
      movies.forEach((m) => m.genres.forEach((g) => { counts[g] = (counts[g] ?? 0) + 1; }));
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [confirmed, movies]);

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Total Bookings', value: totalBookings, icon: Ticket, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Seats Sold', value: totalSeats, icon: TrendingUp, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Active Users', value: activeUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Movies', value: movies.length, icon: Film, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Branches', value: branches.length, icon: Building2, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
      <p className="text-ink-400 mb-6">System-wide performance overview.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 animate-fade-in" >
              <div style={{ animationDelay: `${i * 50}ms` }}>
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-ink-400 mt-1">{s.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue trend */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Revenue Trend (7 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26262d" />
              <XAxis dataKey="day" stroke="#71717b" fontSize={12} />
              <YAxis stroke="#71717b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#18181d', border: '1px solid #2e2e36', borderRadius: 12, color: '#fff' }} />
              <Line type="monotone" dataKey="revenue" stroke="#E50914" strokeWidth={2} dot={{ fill: '#E50914', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Branch comparison */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Revenue by Branch</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={branchRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26262d" />
              <XAxis dataKey="name" stroke="#71717b" fontSize={12} />
              <YAxis stroke="#71717b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#18181d', border: '1px solid #2e2e36', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="revenue" fill="#F5C518" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top movies */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Top Movies by Seats Sold</h3>
          {topMovies.length === 0 ? (
            <p className="text-sm text-ink-400 py-10 text-center">No booking data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topMovies} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#26262d" />
                <XAxis type="number" stroke="#71717b" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#71717b" fontSize={11} width={100} />
                <Tooltip contentStyle={{ background: '#18181d', border: '1px solid #2e2e36', borderRadius: 12, color: '#fff' }} />
                <Bar dataKey="seats" fill="#E50914" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Genre distribution */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Genre Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={genreData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                {genreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#18181d', border: '1px solid #2e2e36', borderRadius: 12, color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Branch comparison table */}
      <Card className="p-6 mt-6">
        <h3 className="font-semibold mb-4">Branch Performance Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-ink-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Branch</th>
                <th className="text-left px-4 py-2 font-medium">City</th>
                <th className="text-right px-4 py-2 font-medium">Bookings</th>
                <th className="text-right px-4 py-2 font-medium">Revenue</th>
                <th className="text-right px-4 py-2 font-medium">Avg / Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {branchRevenue.map((b, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium">{branches[i]?.name}</td>
                  <td className="px-4 py-3 text-ink-300">{b.name}</td>
                  <td className="px-4 py-3 text-right">{b.bookings}</td>
                  <td className="px-4 py-3 text-right text-success font-semibold">${b.revenue}</td>
                  <td className="px-4 py-3 text-right text-ink-300">{b.bookings > 0 ? `$${(b.revenue / b.bookings).toFixed(2)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
