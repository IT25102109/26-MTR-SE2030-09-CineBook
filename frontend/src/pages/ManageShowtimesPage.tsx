import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, Calendar, Clock, Film, MapPin } from 'lucide-react';
import { getShowtimes, getMovies, getBranches, saveShowtime, deleteShowtime } from '@/data/store';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import type { Showtime } from '@/types';

const times = ['10:00 AM', '1:15 PM', '4:30 PM', '7:00 PM', '10:15 PM'];

export function ManageShowtimesPage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);

  const showtimes = useMemo(() => getShowtimes(), [tick]);
  const movies = useMemo(() => getMovies(), []);
  const branches = useMemo(() => getBranches(), []);

  const [search, setSearch] = useState('');
  const [movieFilter, setMovieFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Showtime | null>(null);

  const [formData, setFormData] = useState({
    movieId: movies[0]?.id || '',
    branchId: branches[0]?.id || '',
    hallId: branches[0]?.halls[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: times[0],
    basePrice: 14.99,
    premiumPrice: 22.99,
  });

  const filtered = showtimes.filter(s => {
    if (movieFilter !== 'all' && s.movieId !== movieFilter) return false;
    if (branchFilter !== 'all' && s.branchId !== branchFilter) return false;
    if (search) {
      const movie = movies.find(m => m.id === s.movieId);
      if (!movie?.title.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const getMovieTitle = (id: string) => movies.find(m => m.id === id)?.title || 'Unknown';
  const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'Unknown';
  const getHallName = (branchId: string, hallId: string) => {
    const b = branches.find(b => b.id === branchId);
    return b?.halls.find(h => h.id === hallId)?.name || 'Unknown';
  };

  const availableHalls = branches.find(b => b.id === formData.branchId)?.halls || [];

  const handleSave = () => {
    if (!formData.movieId || !formData.branchId || !formData.hallId) {
      toast('error', 'Please select a movie, branch, and hall');
      return;
    }
    const showtime: Showtime = {
      id: '',
      ...formData,
      bookedSeats: [],
    };
    saveShowtime(showtime);
    setModalOpen(false);
    setTick(t => t + 1);
    toast('success', 'Showtime added successfully');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteShowtime(deleteTarget.id);
    setDeleteTarget(null);
    setTick(t => t + 1);
    toast('success', 'Showtime deleted');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Manage Showtimes</h1>
          <p className="text-text-secondary">Schedule and manage movie showtimes across branches</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Showtime
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by movie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-cinema-base border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent-primary/50 transition-all"
            />
          </div>
          <Select value={movieFilter} onChange={e => setMovieFilter(e.target.value)}>
            <option value="all">All Movies</option>
            {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </Select>
          <Select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
            <option value="all">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
        </div>
      </Card>

      <div className="mb-4 text-sm text-text-secondary">
        {filtered.length} showtime{filtered.length !== 1 ? 's' : ''} found
      </div>

      <Table
        columns={[
          {
            key: 'movie',
            header: 'Movie',
            render: (s) => (
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-text-muted flex-shrink-0" />
                <span className="font-medium">{getMovieTitle(s.movieId)}</span>
              </div>
            ),
          },
          {
            key: 'branch',
            header: 'Branch',
            render: (s) => (
              <span className="text-text-secondary">{getBranchName(s.branchId)}</span>
            ),
          },
          {
            key: 'hall',
            header: 'Hall',
            render: (s) => <span className="text-text-secondary">{getHallName(s.branchId, s.hallId)}</span>,
          },
          {
            key: 'date',
            header: 'Date',
            render: (s) => (
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ),
          },
          {
            key: 'time',
            header: 'Time',
            render: (s) => (
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Clock className="w-3.5 h-3.5" />
                {s.time}
              </span>
            ),
          },
          {
            key: 'seats',
            header: 'Booked',
            render: (s) => (
              <Badge variant={s.bookedSeats.length > 0 ? 'amber' : 'default'}>
                {s.bookedSeats.length} seats
              </Badge>
            ),
          },
          {
            key: 'price',
            header: 'Price',
            render: (s) => <span className="text-accent-primary font-medium">${s.basePrice}</span>,
          },
          {
            key: 'actions',
            header: '',
            render: (s) => (
              <button
                onClick={() => setDeleteTarget(s)}
                className="text-text-muted hover:text-accent-destructive transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ),
          },
        ]}
        data={filtered}
        emptyMessage="No showtimes found. Add one to get started."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Showtime"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Add Showtime</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Movie" value={formData.movieId} onChange={e => setFormData({ ...formData, movieId: e.target.value })}>
            {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </Select>
          <Select
            label="Branch"
            value={formData.branchId}
            onChange={e => setFormData({ ...formData, branchId: e.target.value, hallId: branches.find(b => b.id === e.target.value)?.halls[0]?.id || '' })}
          >
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
          <Select label="Hall" value={formData.hallId} onChange={e => setFormData({ ...formData, hallId: e.target.value })}>
            {availableHalls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            <Select label="Time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}>
              {times.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Base Price ($)" type="number" step="0.01" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })} />
            <Input label="Premium Price ($)" type="number" step="0.01" value={formData.premiumPrice} onChange={e => setFormData({ ...formData, premiumPrice: parseFloat(e.target.value) || 0 })} />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Showtime?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Delete showtime for <span className="font-medium text-text-primary">{deleteTarget && getMovieTitle(deleteTarget.movieId)}</span> on{' '}
          {deleteTarget && new Date(deleteTarget.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {deleteTarget?.time}?
        </p>
      </Modal>
    </div>
  );
}
