import { useMemo, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Film } from 'lucide-react';
import { getMovies, saveMovie, deleteMovie } from '@/data/store';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import type { Movie } from '@/types';

const emptyMovie: Omit<Movie, 'id'> = {
  title: '',
  synopsis: '',
  poster: '',
  backdrop: '',
  genre: [],
  language: 'English',
  duration: 120,
  rating: 7.0,
  certification: 'PG-13',
  director: '',
  cast: [],
  releaseDate: new Date().toISOString().split('T')[0],
  status: 'now-showing',
  featured: false,
  trailerUrl: '#',
};

export function ManageMoviesPage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const movies = useMemo(() => getMovies(), [tick]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [formData, setFormData] = useState<Omit<Movie, 'id'>>({ ...emptyMovie });
  const [genreInput, setGenreInput] = useState('');
  const [castInput, setCastInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Movie | null>(null);

  const filtered = movies.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setFormData({ ...emptyMovie });
    setGenreInput('');
    setCastInput('');
    setModalOpen(true);
  };

  const openEdit = (movie: Movie) => {
    setEditing(movie);
    setFormData({ ...movie });
    setGenreInput(movie.genre.join(', '));
    setCastInput(movie.cast.join(', '));
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast('error', 'Movie title is required');
      return;
    }
    if (!formData.poster.trim()) {
      toast('error', 'Poster URL is required');
      return;
    }

    const genres = genreInput.split(',').map(g => g.trim()).filter(Boolean);
    const cast = castInput.split(',').map(c => c.trim()).filter(Boolean);

    const movie: Movie = {
      ...formData,
      genre: genres,
      cast,
      id: editing?.id || '',
    };

    saveMovie(movie);
    setModalOpen(false);
    setTick(t => t + 1);
    toast('success', editing ? 'Movie updated successfully' : 'Movie added successfully');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMovie(deleteTarget.id);
    setDeleteTarget(null);
    setTick(t => t + 1);
    toast('success', 'Movie deleted');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Manage Movies</h1>
          <p className="text-text-secondary">Add, edit, and remove movies from the catalog</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add Movie
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-cinema-base border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent-primary/50 transition-all"
            />
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="now-showing">Now Showing</option>
            <option value="coming-soon">Coming Soon</option>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((movie, i) => (
          <Card key={movie.id} className="p-4 group animate-fade-in-up" >
            <div className="flex gap-4" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <img src={movie.poster} alt={movie.title} className="w-20 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate mb-1">{movie.title}</h3>
                <div className="flex items-center gap-1.5 mb-2">
                  <Badge variant={movie.status === 'now-showing' ? 'green' : 'blue'}>
                    {movie.status === 'now-showing' ? 'Showing' : 'Soon'}
                  </Badge>
                  {movie.featured && <Badge variant="amber">Featured</Badge>}
                </div>
                <p className="text-xs text-text-muted">{movie.genre.join(', ')}</p>
                <p className="text-xs text-text-muted">{movie.duration}m • {movie.rating}/10</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(movie)} className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent-primary transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(movie)} className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <Film className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">No movies found</p>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Movie' : 'Add New Movie'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save Changes' : 'Add Movie'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Movie title" />
          <Textarea label="Synopsis" value={formData.synopsis} onChange={e => setFormData({ ...formData, synopsis: e.target.value })} placeholder="Movie synopsis" rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Poster URL" value={formData.poster} onChange={e => setFormData({ ...formData, poster: e.target.value })} placeholder="https://..." />
            <Input label="Backdrop URL" value={formData.backdrop} onChange={e => setFormData({ ...formData, backdrop: e.target.value })} placeholder="https://..." />
          </div>
          <Input label="Genres (comma-separated)" value={genreInput} onChange={e => setGenreInput(e.target.value)} placeholder="Sci-Fi, Drama, Action" />
          <Input label="Cast (comma-separated)" value={castInput} onChange={e => setCastInput(e.target.value)} placeholder="Actor 1, Actor 2" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Director" value={formData.director} onChange={e => setFormData({ ...formData, director: e.target.value })} placeholder="Director name" />
            <Input label="Language" value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} placeholder="English" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Duration (min)" type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })} />
            <Input label="Rating (0-10)" type="number" step="0.1" value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} />
            <Input label="Certification" value={formData.certification} onChange={e => setFormData({ ...formData, certification: e.target.value })} placeholder="PG-13" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as Movie['status'] })}>
              <option value="now-showing">Now Showing</option>
              <option value="coming-soon">Coming Soon</option>
            </Select>
            <Input label="Release Date" type="date" value={formData.releaseDate} onChange={e => setFormData({ ...formData, releaseDate: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={e => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 rounded accent-accent-primary"
            />
            <span className="text-sm text-text-secondary">Featured in hero carousel</span>
          </label>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Movie?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete <span className="font-medium text-text-primary">{deleteTarget?.title}</span>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
