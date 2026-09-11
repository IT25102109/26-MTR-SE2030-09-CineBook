import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Film } from 'lucide-react';
import { store, uid } from '@/data/store';
import type { Movie } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';

const emptyMovie: Omit<Movie, 'id'> = {
  title: '',
  synopsis: '',
  cast: [],
  director: '',
  genres: [],
  language: 'English',
  rating: 7.0,
  durationMin: 120,
  releaseDate: new Date().toISOString().split('T')[0],
  posterUrl: '',
  backdropUrl: '',
  trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  status: 'now_showing',
  featured: false,
};

export function ManageMoviesPage() {
  const { branchId } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [form, setForm] = useState<Omit<Movie, 'id'>>(emptyMovie);
  const [deleteTarget, setDeleteTarget] = useState<Movie | null>(null);

  const refresh = () => setMovies(store.getMovies());
  useEffect(() => { refresh(); }, []);

  const filtered = movies.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()));

  const openAdd = () => {
    setEditing(null);
    setForm(emptyMovie);
    setFormOpen(true);
  };
  const openEdit = (m: Movie) => {
    setEditing(m);
    const { id, ...rest } = m;
    void id;
    setForm(rest);
    setFormOpen(true);
  };

  const save = () => {
    if (!form.title.trim()) return;
    const all = store.getMovies();
    if (editing) {
      const idx = all.findIndex((m) => m.id === editing.id);
      if (idx >= 0) all[idx] = { ...all[idx], ...form };
    } else {
      all.push({ ...form, id: uid('m') });
    }
    store.setMovies(all);
    setFormOpen(false);
    refresh();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    store.setMovies(store.getMovies().filter((m) => m.id !== deleteTarget.id));
    store.setShowtimes(store.getShowtimes().filter((s) => s.movieId !== deleteTarget.id));
    setDeleteTarget(null);
    refresh();
  };

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Movies</h1>
          <p className="text-sm text-ink-400">{branchId ? 'Your branch' : 'All branches'} • {filtered.length} movies</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Movie</Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search movies..." className="w-full bg-ink-850 border border-ink-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-800/50 text-ink-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Movie</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Genre</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Rating</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Duration</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={m.posterUrl} alt={m.title} className="w-10 h-14 rounded object-cover shrink-0" />
                      <div>
                        <div className="font-medium">{m.title}</div>
                        <div className="text-xs text-ink-400">{m.language}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">{m.genres.join(', ')}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{m.rating.toFixed(1)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{m.durationMin}m</td>
                  <td className="px-4 py-3">
                    {m.status === 'now_showing' ? <Badge variant="success">Now Showing</Badge> : <Badge variant="warning">Coming Soon</Badge>}
                    {m.featured && <Badge variant="gold" className="ml-1">Featured</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(m)} className="p-2 rounded-lg hover:bg-white/10 transition-colors"><Pencil className="w-4 h-4 text-ink-300" /></button>
                      <button onClick={() => setDeleteTarget(m)} className="p-2 rounded-lg hover:bg-error/20 transition-colors"><Trash2 className="w-4 h-4 text-error" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-ink-400">
            <Film className="w-12 h-12 mx-auto mb-3 text-ink-600" />
            No movies found.
          </div>
        )}
      </Card>

      {/* Add/Edit modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Movie' : 'Add Movie'} size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Movie title" />
          <Textarea label="Synopsis" rows={3} value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} placeholder="Movie synopsis" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Director" value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })} />
            <Input label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
          </div>
          <Input label="Cast (comma separated)" value={form.cast.join(', ')} onChange={(e) => setForm({ ...form, cast: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
          <Input label="Genres (comma separated)" value={form.genres.join(', ')} onChange={(e) => setForm({ ...form, genres: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Rating (0-10)" type="number" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} />
            <Input label="Duration (min)" type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: parseInt(e.target.value) || 0 })} />
            <Input label="Release Date" type="date" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} />
          </div>
          <Input label="Poster URL" value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} placeholder="https://..." />
          <Input label="Backdrop URL" value={form.backdropUrl} onChange={(e) => setForm({ ...form, backdropUrl: e.target.value })} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Movie['status'] })}>
              <option value="now_showing">Now Showing</option>
              <option value="coming_soon">Coming Soon</option>
            </Select>
            <Select label="Featured" value={form.featured ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, featured: e.target.value === 'yes' })}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save Changes' : 'Add Movie'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Movie" size="sm">
        <p className="text-ink-300 mb-2">Are you sure you want to delete <span className="font-semibold">{deleteTarget?.title}</span>?</p>
        <p className="text-xs text-ink-400 mb-5">This will also remove all showtimes for this movie. This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
