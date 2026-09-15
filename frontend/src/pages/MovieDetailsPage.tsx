import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, Film, Play, ChevronLeft, MapPin } from 'lucide-react';
import { getMovie, getShowtimesByMovie, getBranches, getBranch } from '@/data/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movie = useMemo(() => id ? getMovie(id) : undefined, [id]);
  const showtimes = useMemo(() => id ? getShowtimesByMovie(id) : [], [id]);
  const branches = useMemo(() => getBranches(), []);

  const [selectedBranch, setSelectedBranch] = useState<string>(branches[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const dates = useMemo(() => {
    const set = new Set(showtimes.map(s => s.date));
    return Array.from(set).sort();
  }, [showtimes]);

  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(s => {
      if (selectedBranch && s.branchId !== selectedBranch) return false;
      if (selectedDate && s.date !== selectedDate) return false;
      return true;
    });
  }, [showtimes, selectedBranch, selectedDate]);

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">Movie not found</h1>
        <Link to="/movies"><Button>Browse Movies</Button></Link>
      </div>
    );
  }

  const branchShowtimes = filteredShowtimes.reduce((acc, s) => {
    const key = s.branchId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, typeof showtimes>);

  return (
    <div>
      {/* Hero backdrop */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-base via-cinema-base/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-base/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10">
        <Link to="/movies" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent-primary transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to Movies
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-40 sm:w-52 mx-auto md:mx-0">
            <div className="rounded-2xl overflow-hidden shadow-soft-xl hairline">
              <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant={movie.status === 'now-showing' ? 'green' : 'blue'}>
                {movie.status === 'now-showing' ? 'Now Showing' : 'Coming Soon'}
              </Badge>
              <Badge variant="amber"><Star className="w-3 h-3 fill-accent-primary text-accent-primary" />{movie.rating}</Badge>
              <Badge variant="outline">{movie.certification}</Badge>
            </div>

            <h1 className="text-display font-display font-bold mb-3">{movie.title}</h1>

            <div className="flex items-center gap-4 text-sm text-text-secondary mb-5 flex-wrap">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{movie.duration} min</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              <span className="flex items-center gap-1.5"><Film className="w-4 h-4" />{movie.language}</span>
            </div>

            <p className="text-text-secondary leading-relaxed mb-6 max-w-2xl">{movie.synopsis}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-xl">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Director</p>
                <p className="text-sm font-medium">{movie.director}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Cast</p>
                <p className="text-sm font-medium">{movie.cast.join(', ')}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Genres</p>
                <div className="flex gap-1.5 flex-wrap">
                  {movie.genre.map(g => <Badge key={g} variant="default">{g}</Badge>)}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="lg">
                <Play className="w-4 h-4 fill-current" /> Watch Trailer
              </Button>
              {movie.status === 'now-showing' && (
                <Button size="lg" variant="outline" onClick={() => document.getElementById('showtimes')?.scrollIntoView({ behavior: 'smooth' })}>
                  Book Now
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Showtimes */}
        {movie.status === 'now-showing' && (
          <section id="showtimes" className="mt-16 scroll-mt-20">
            <h2 className="text-2xl font-display font-bold mb-6">Showtimes</h2>

            <Card className="p-5 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">Select Cinema</label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedBranch('')}
                      className={`px-3 py-2 rounded-lg text-sm border transition-all ${!selectedBranch ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : 'border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                    >
                      All Cinemas
                    </button>
                    {branches.map(b => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBranch(b.id)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-all ${selectedBranch === b.id ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : 'border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                      >
                        {b.name.replace('CineBook ', '')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">Select Date</label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                      onClick={() => setSelectedDate('')}
                      className={`px-3 py-2 rounded-lg text-sm border transition-all whitespace-nowrap ${!selectedDate ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : 'border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                    >
                      All Dates
                    </button>
                    {dates.map(d => (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-all whitespace-nowrap ${selectedDate === d ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : 'border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                      >
                        {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              {Object.entries(branchShowtimes).length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-text-muted">No showtimes match your selection.</p>
                </Card>
              ) : (
                Object.entries(branchShowtimes).map(([branchId, shows]) => {
                  const branch = getBranch(branchId);
                  if (!branch) return null;
                  return (
                    <Card key={branchId} className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-accent-primary" />
                        <h3 className="font-display font-semibold">{branch.name}</h3>
                        <span className="text-sm text-text-muted">{branch.city}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {shows.map(s => {
                          const hall = branch.halls.find(h => h.id === s.hallId);
                          return (
                            <button
                              key={s.id}
                              onClick={() => navigate(`/booking/${s.id}`)}
                              className="group flex flex-col p-4 rounded-xl bg-cinema-elevated border border-white/5 hover:border-accent-primary/30 hover:bg-cinema-border transition-all text-left"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-display font-semibold text-lg">{s.time}</span>
                                <span className="text-xs text-text-muted">{hall?.name}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary">
                                  {new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-sm font-medium text-accent-primary">${s.basePrice}</span>
                              </div>
                              <div className="mt-2 pt-2 border-t border-white/5">
                                <span className="text-xs text-text-muted group-hover:text-accent-primary transition-colors">
                                  {hall && hall.rows * hall.seatsPerRow - s.bookedSeats.length} seats available →
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
