import { useMemo } from 'react';
import { TrendingUp, DollarSign, Users, Ticket, BarChart3, PieChart, Building2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getBookings, getMovies, getBranches, getUsers, getShowtimes } from '@/data/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const COLORS = ['#F5C518', '#E50914', '#3B82F6', '#10B981', '#8B5CF6', '#F97316', '#EC4899', '#06B6D4'];

export function AnalyticsPage() {
  const bookings = useMemo(() => getBookings(), []);
  const movies = useMemo(() => getMovies(), []);
  const branches = useMemo(() => getBranches(), []);
  const users = useMemo(() => getUsers(), []);
  const showtimes = useMemo(() => getShowtimes(), []);

  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0);
  const activeUsers = users.length;
  const totalTickets = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.seats.length, 0);

  // Revenue trend (mock last 6 months)
  const revenueData = useMemo(() => {
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    return months.map((month, i) => ({
      month,
      revenue: Math.round(8000 + Math.random() * 12000 + i * 1500),
      bookings: Math.round(200 + Math.random() * 300 + i * 50),
    }));
  }, []);

  // Top movies by bookings
  const topMovies = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.filter(b => b.status === 'confirmed').forEach(b => {
      counts[b.movieTitle] = (counts[b.movieTitle] || 0) + b.seats.length;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [bookings]);

  // Occupancy by branch
  const branchOccupancy = useMemo(() => {
    return branches.map(branch => {
      const branchShowtimes = showtimes.filter(s => s.branchId === branch.id);
      const totalCapacity = branchShowtimes.reduce((sum, s) => {
        const hall = branch.halls.find(h => h.id === s.hallId);
        return sum + (hall ? hall.rows * hall.seatsPerRow : 0);
      }, 0);
      const totalBooked = branchShowtimes.reduce((sum, s) => sum + s.bookedSeats.length, 0);
      return {
        name: branch.name.replace('CineBook ', ''),
        occupancy: totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0,
        revenue: Math.round(totalBooked * 18 + Math.random() * 5000),
      };
    });
  }, [branches, showtimes]);

  // Genre distribution
  const genreData = useMemo(() => {
    const counts: Record<string, number> = {};
    movies.forEach(m => m.genre.forEach(g => { counts[g] = (counts[g] || 0) + 1; }));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [movies]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-text-secondary">Platform-wide insights and performance metrics</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#F5C518', change: '+12.5%' },
          { label: 'Tickets Sold', value: totalTickets.toString(), icon: Ticket, color: '#10B981', change: '+8.2%' },
          { label: 'Active Users', value: activeUsers.toString(), icon: Users, color: '#3B82F6', change: '+5.1%' },
          { label: 'Total Showtimes', value: showtimes.length.toString(), icon: Building2, color: '#E50914', change: '+3.7%' },
        ].map((stat, i) => (
          <Card key={i} className="p-5 animate-fade-in-up" >
            <div className="flex items-center justify-between mb-3" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <Badge variant="green">{stat.change}</Badge>
            </div>
            <p className="text-2xl font-display font-bold">{stat.value}</p>
            <p className="text-sm text-text-muted mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue trend */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-accent-primary" />
            <h3 className="font-display font-semibold">Revenue & Bookings Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
              <XAxis dataKey="month" stroke="#8A8A94" fontSize={12} />
              <YAxis stroke="#8A8A94" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1C1C21', border: '1px solid #1E1E24', borderRadius: '12px', color: '#F2F2F0' }}
                labelStyle={{ color: '#F2F2F0' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#F5C518" strokeWidth={2} dot={{ fill: '#F5C518', r: 4 }} name="Revenue ($)" />
              <Line type="monotone" dataKey="bookings" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Genre distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <PieChart className="w-5 h-5 text-accent-primary" />
            <h3 className="font-display font-semibold">Genre Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie data={genreData}>
              <Pie
                data={genreData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={45}
                dataKey="value"
                paddingAngle={3}
              >
                {genreData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1C1C21', border: '1px solid #1E1E24', borderRadius: '12px', color: '#F2F2F0' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </RechartsPie>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top movies */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-accent-primary" />
            <h3 className="font-display font-semibold">Top Movies by Tickets Sold</h3>
          </div>
          {topMovies.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topMovies} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" horizontal={false} />
                <XAxis type="number" stroke="#8A8A94" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#8A8A94" fontSize={11} width={120} tickFormatter={(val: string) => val.length > 15 ? val.slice(0, 15) + '...' : val} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C1C21', border: '1px solid #1E1E24', borderRadius: '12px', color: '#F2F2F0' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="value" fill="#F5C518" radius={[0, 6, 6, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-text-muted text-sm">No booking data yet</div>
          )}
        </Card>

        {/* Branch occupancy */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5 text-accent-primary" />
            <h3 className="font-display font-semibold">Branch Occupancy & Revenue</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={branchOccupancy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
              <XAxis dataKey="name" stroke="#8A8A94" fontSize={12} />
              <YAxis stroke="#8A8A94" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1C1C21', border: '1px solid #1E1E24', borderRadius: '12px', color: '#F2F2F0' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="occupancy" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Occupancy %" />
              <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
