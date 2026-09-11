import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react';
import { store, uid } from '@/data/store';
import type { Showtime, Movie, CinemaHall, CinemaBranch } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';

export function ManageShowtimesPage() {
  const { branchId } = useAuth();
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [halls, setHalls] = useState<CinemaHall[]>([]);
  const [branches, setBranches] = useState<CinemaBranch[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Showtime | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Showtime | null>(null);
  const [filterMovie, setFilterMovie] = useState('all');

  const emptyForm: Omit<Showtime, 'id' | 'bookedSeats'> = {
    movieId: '',
    branchId: branchId ?? 'b1',
    hallId: '',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    price: 14.0,
    premiumPrice: 19.0,
  };
  const [form, setForm] = useState(emptyForm);

  const refresh = () => {
    const all = store.getShowtimes();
    setShowtimes(branchId ? all.filter((s) => s.branchId === branchId) : all);
    setMovies(store.getMovies());
    setHalls(store.getHalls());
    setBranches(store.getBranches());
  };
  useEffect(() => { refresh(); }, [branchId]);

  const filtered = showtimes.filter((s) => filterMovie === 'all' || s.movieId === filterMovie);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, movieId: movies[0]?.id ?? '', hallId: halls.filter((h) => h.branchId === (branchId ?? 'b1'))[0]?.id ?? '' });
    setFormOpen(true);
  };
  const openEdit = (s: Showtime) => {
    setEditing(s);
    const { id, bookedSeats, ...rest } = s;
    void id; void bookedSeats;
    setForm(rest);
    setFormOpen(true);
  };

  const save = () => {
    if (!form.movieId || !form.hallId) return;
    const all = store.getShowtimes();
    if (editing) {
      const idx = all.findIndex((s) => s.id === editing.id);
      if (idx >= 0) all[idx] = { ...all[idx], ...form };
    } else {
      all.push({ ...form, id: uid('s'), bookedSeats: [] });
    }
    store.setShowtimes(all);
    setFormOpen(false);
    refresh();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    store.setShowtimes(store.getShowtimes().filter((s) => s.id !== deleteTarget.id));
    setDeleteTarget(null);
    refresh();
  };

  const getMovie = (id: string) => movies.find((m) => m.id === id);
  const getHall = (id: string) => halls.find((h) => h.id === id);
  const getBranch = (id: string) => branches.find((b) => b.id === id);
  const availableHalls = halls.filter((h) => h.branchId === form.branchId);

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Showtimes</h1>
          <p className="text-sm text-ink-400">{branchId ? getBranch(branchId)?.name : 'All branches'} • {filtered.length} showtimes</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Showtime</Button>
      </div>

      <div className="w-56 mb-4">
        <Select value={filterMovie} onChange={(e) => setFilterMovie(e.target.value)}>
          <option value="all">All Movies</option>
          {movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
        </Select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-800/50 text-ink-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Movie</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Branch / Hall</th>
                <th className="text-left px-4 py-3 font-medium">Date & Time</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Price</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Booked</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((s) => {
                const m = getMovie(s.movieId);
                const h = getHall(s.hallId);
                const br = getBranch(s.branchId);
                return (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={m?.posterUrl} alt="" className="w-8 h-12 rounded object-cover shrink-0" />
                        <span className="font-medium">{m?.title ?? 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-ink-300">{br?.name}<br /><span className="text-xs text-ink-400">{h?.name}</span></td>
                    <td className="px-4 py-3">
                      <div>{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      <div className="text-xs text-ink-400">{s.time}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">${s.price.toFixed(2)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell"><Badge variant="outline">{s.bookedSeats.length} seats</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-white/10 transition-colors"><Pencil className="w-4 h-4 text-ink-300" /></button>
                        <button onClick={() => setDeleteTarget(s)} className="p-2 rounded-lg hover:bg-error/20 transition-colors"><Trash2 className="w-4 h-4 text-error" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-ink-400">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 text-ink-600" />
            No showtimes found.
          </div>
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Showtime' : 'Add Showtime'} size="md">
        <div className="space-y-4">
          <Select label="Movie" value={form.movieId} onChange={(e) => setForm({ ...form, movieId: e.target.value })}>
            <option value="">Select a movie</option>
            {movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </Select>
          <Select label="Branch" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value, hallId: '' })} disabled={!!branchId}>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name} — {b.city}</option>)}
          </Select>
          <Select label="Cinema Hall" value={form.hallId} onChange={(e) => setForm({ ...form, hallId: e.target.value })}>
            <option value="">Select a hall</option>
            {availableHalls.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Standard Price ($)" type="number" step="0.5" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
            <Input label="Premium Price ($)" type="number" step="0.5" value={form.premiumPrice} onChange={(e) => setForm({ ...form, premiumPrice: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save Changes' : 'Add Showtime'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Showtime" size="sm">
        <p className="text-ink-300 mb-5">Are you sure you want to delete this showtime? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
