import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Film, MessageSquare, CheckCircle, XCircle, Star } from 'lucide-react';
import { getMovies, saveMovie, deleteMovie, getAllReviewsForModeration, updateReviewStatus, deleteReview } from '@/data/store';
import { movieApi } from '@/api/movieApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import type { Movie, MovieReview } from '@/types';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>(() => getMovies());
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [formData, setFormData] = useState<Omit<Movie, 'id'>>({ ...emptyMovie });
  const [genreInput, setGenreInput] = useState('');
  const [castInput, setCastInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Movie | null>(null);

  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [reviewTick, setReviewTick] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const allReviews = useMemo(() => getAllReviewsForModeration(), [reviewTick]);
  const pendingReviewsCount = useMemo(() => allReviews.filter(r => r.status === 'pending').length, [allReviews]);
  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'all') return allReviews;
    return allReviews.filter(r => r.status === reviewFilter);
  }, [allReviews, reviewFilter]);

  // Fetch live movies from backend API or local store on mount
  const loadMovies = async () => {
    try {
      const liveList = await movieApi.getMovies();
      if (Array.isArray(liveList) && liveList.length > 0) {
        setMovies(liveList);
      } else {
        setMovies(getMovies());
      }
    } catch (err) {
      console.warn('Backend API not responding, using local store data:', err);
      setMovies(getMovies());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

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

  const handleSave = async () => {
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

    const movieToSave: Movie = {
      ...formData,
      genre: genres,
      cast,
      id: editing?.id || '',
    };

    try {
      saveMovie(movieToSave);
      setModalOpen(false);
      toast('success', editing ? 'Movie updated successfully' : 'Movie added successfully');
      await loadMovies();
    } catch (err) {
      console.error('Error saving movie:', err);
      toast('error', 'Failed to save movie');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      deleteMovie(deleteTarget.id);
      setDeleteTarget(null);
      toast('success', 'Movie deleted');
      await loadMovies();
    } catch (err) {
      console.error('Error deleting movie:', err);
      toast('error', 'Failed to delete movie');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">Manage Movies</h1>
          <p className="text-text-secondary text-sm">Add, edit, and manage movie listings in the catalog</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setReviewsModalOpen(true)}
            className="text-xs h-9 relative flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4 text-accent-primary" />
            Review Moderation
            {pendingReviewsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full animate-pulse">
                {pendingReviewsCount} Pending
              </span>
            )}
          </Button>
          <Button onClick={openCreate} className="text-xs h-9">
            <Plus className="w-4 h-4 mr-1" /> Add Movie
          </Button>
        </div>
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
              className="w-full bg-cinema-base border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent-primary/50 transition-all"
            />
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status ({movies.length})</option>
            <option value="now-showing">Now Showing</option>
            <option value="coming-soon">Coming Soon</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="p-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-text-muted">Fetching movie records...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((movie) => (
            <Card key={movie.id} className="p-4 group border border-white/5 hover:border-white/10 transition-all">
              <div className="flex gap-4">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-20 h-28 rounded-lg object-cover flex-shrink-0 shadow-md bg-white/5"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm truncate mb-1 text-text-primary">{movie.title}</h3>
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <Badge variant={movie.status === 'now-showing' ? 'green' : 'blue'} className="text-[11px]">
                        {movie.status === 'now-showing' ? 'Showing' : 'Soon'}
                      </Badge>
                      {movie.featured && <Badge variant="amber" className="text-[11px]">Featured</Badge>}
                    </div>
                    <p className="text-xs text-text-muted truncate">{movie.genre.join(', ')}</p>
                    <p className="text-xs text-text-muted mt-0.5">{movie.duration}m • ★ {movie.rating}/10</p>
                  </div>

                  <div className="flex gap-3 mt-3 pt-2 border-t border-white/5">
                    <button
                      onClick={() => openEdit(movie)}
                      className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent-primary transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(movie)}
                      className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Film className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-base font-medium mb-1">No movies found</p>
          <p className="text-xs text-text-muted mb-4">
            {search ? 'Try adjusting your search query.' : 'Get started by adding a movie to your cinema catalog.'}
          </p>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Add Movie
          </Button>
        </Card>
      )}

      {/* Add / Edit Movie Modal */}
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

      {/* Delete Confirmation Modal */}
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
          Are you sure you want to delete <span className="font-medium text-text-primary">{deleteTarget?.title}</span>? This action will remove the movie from the catalog.
        </p>
      </Modal>

      {/* Audience Review Moderation Modal */}
      <Modal
        open={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        title="Audience Review Moderation"
        size="lg"
        footer={<Button variant="ghost" onClick={() => setReviewsModalOpen(false)}>Close</Button>}
      >
        <div className="space-y-4">
          <p className="text-xs text-text-secondary">
            Manage customer reviews before or after publication. Community reviews require staff approval before displaying publicly.
          </p>

          {/* Filter tabs */}
          <div className="flex gap-2 border-b border-cinema-border pb-3 flex-wrap">
            <button
              onClick={() => setReviewFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                reviewFilter === 'pending'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              Pending ({pendingReviewsCount})
            </button>
            <button
              onClick={() => setReviewFilter('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                reviewFilter === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              Approved ({allReviews.filter(r => r.status === 'approved').length})
            </button>
            <button
              onClick={() => setReviewFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                reviewFilter === 'rejected'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              Rejected ({allReviews.filter(r => r.status === 'rejected').length})
            </button>
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                reviewFilter === 'all'
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              All ({allReviews.length})
            </button>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="py-8 text-center text-text-muted">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                {reviewFilter === 'pending'
                  ? 'No pending reviews! All audience reviews have been moderated.'
                  : `No ${reviewFilter} reviews found.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-cinema-border max-h-[60vh] overflow-y-auto pr-1 space-y-3">
              {filteredReviews.map(r => {
                const movie = movies.find(m => m.id === r.movieId);
                return (
                  <div key={r.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-text-primary">{r.userName}</span>
                        <Badge variant="default" className="text-[11px]">{movie?.title || 'Movie'}</Badge>
                        <Badge
                          variant={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'amber'}
                          className="text-[10px]"
                        >
                          {r.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">{r.comment}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-0.5 text-accent-primary">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-accent-primary' : 'text-text-muted opacity-30'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-text-muted">Rating: {r.rating}/5</span>
                        <span className="text-xs text-text-muted">•</span>
                        <span className="text-xs text-text-muted">{r.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                      {r.status !== 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            updateReviewStatus(r.id, 'approved', user);
                            setReviewTick(t => t + 1);
                            toast('success', `Approved review by ${r.userName}`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-2.5 flex items-center gap-1 font-semibold"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </Button>
                      )}
                      {r.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            updateReviewStatus(r.id, 'rejected', user);
                            setReviewTick(t => t + 1);
                            toast('error', `Rejected review by ${r.userName}`);
                          }}
                          className="text-red-400 hover:bg-red-500/10 text-xs h-8 px-2.5 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          deleteReview(r.id, user);
                          setReviewTick(t => t + 1);
                          toast('success', 'Review deleted');
                        }}
                        className="text-text-muted hover:text-red-400 text-xs h-8 p-1.5"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
