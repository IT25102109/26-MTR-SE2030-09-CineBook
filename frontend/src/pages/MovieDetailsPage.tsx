import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Clock, Calendar, Globe, ArrowLeft, Play, MapPin, ChevronRight } from 'lucide-react';
import { store } from '@/data/store';
import type { Movie, Showtime, CinemaBranch, CinemaHall } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [branches, setBranches] = useState<CinemaBranch[]>([]);
  const [halls, setHalls] = useState<CinemaHall[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');

  useEffect(() => {
    if (!id) return;
    setMovie(store.getMovies().find((m) => m.id === id) ?? null);
    setShowtimes(store.getShowtimes().filter((s) => s.movieId === id));
    setBranches(store.getBranches());
    setHalls(store.getHalls());
  }, [id]);

  const dates = useMemo(() => {
    const unique = Array.from(new Set(showtimes.map((s) => s.date))).sort();
    return unique;
  }, [showtimes]);

  const filteredShowtimes = useMemo(() => {
    return showtimes.filter((s) => {
      if (selectedBranch !== 'all' && s.branchId !== selectedBranch) return false;
      if (selectedDate !== 'all' && s.date !== selectedDate) return false;
      return true;
    });
  }, [showtimes, selectedBranch, selectedDate]);

  if (!movie) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-ink-400 mb-4">Movie not found.</p>
        <Link to="/movies"><Button>Back to Movies</Button></Link>
      </div>
    );
  }

  return (
    <div>
      {/* Backdrop */}
      <div className="relative h-[40vh] min-h-[280px] overflow-hidden">
        <img src={movie.backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/40" />
      </div>

      <div className="container-app -mt-32 relative">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ink-300 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-40 md:w-56 shrink-0 mx-auto md:mx-0">
            <img src={movie.posterUrl} alt={movie.title} className="w-full rounded-2xl shadow-card border border-white/10" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {movie.status === 'now_showing' ? <Badge variant="success">Now Showing</Badge> : <Badge variant="warning">Coming Soon</Badge>}
              <Badge variant="gold"><Star className="w-3 h-3 fill-gold" /> {movie.rating.toFixed(1)}</Badge>
              {movie.genres.map((g) => <Badge key={g} variant="accent">{g}</Badge>)}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-ink-300 mb-4">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {movie.durationMin} min</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {movie.language}</span>
            </div>
            <p className="text-ink-200 leading-relaxed mb-4 max-w-2xl">{movie.synopsis}</p>
            <div className="space-y-1 text-sm text-ink-300 mb-6">
              <p><span className="text-ink-400">Director:</span> {movie.director}</p>
              <p><span className="text-ink-400">Cast:</span> {movie.cast.join(', ')}</p>
            </div>

            {/* Trailer placeholder */}
            <div className="relative rounded-2xl overflow-hidden bg-ink-850 border border-white/5 aspect-video max-w-2xl mb-2 group cursor-pointer">
              <img src={movie.backdropUrl} alt="trailer" className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 text-sm text-ink-200">Watch the trailer</div>
            </div>
          </div>
        </div>

        {/* Showtimes */}
        {movie.status === 'now_showing' && (
          <section className="mt-12">
            <h2 className="section-title mb-6">Showtimes</h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-ink-800 border border-ink-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
              >
                <option value="all">All Cinemas</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name} — {b.city}</option>)}
              </select>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-ink-800 border border-ink-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
              >
                <option value="all">All Dates</option>
                {dates.map((d) => <option key={d} value={d}>{new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</option>)}
              </select>
            </div>

            {filteredShowtimes.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-ink-400">No showtimes available for the selected filters.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {dates
                  .filter((d) => selectedDate === 'all' || d === selectedDate)
                  .map((date) => {
                    const dayShowtimes = filteredShowtimes.filter((s) => s.date === date);
                    if (dayShowtimes.length === 0) return null;
                    return (
                      <Card key={date} className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="w-4 h-4 text-accent" />
                          <h3 className="font-semibold">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                        </div>
                        <div className="space-y-3">
                          {dayShowtimes.map((s) => {
                            const branch = branches.find((b) => b.id === s.branchId);
                            const hall = halls.find((h) => h.id === s.hallId);
                            return (
                              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-ink-800/50 hover:bg-ink-800 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="text-center min-w-[64px]">
                                    <div className="text-lg font-bold text-accent">{s.time}</div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm">{branch?.name}</div>
                                    <div className="text-xs text-ink-400 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" /> {branch?.city} • {hall?.name}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="text-sm font-semibold">${s.price.toFixed(2)}</div>
                                    <div className="text-xs text-ink-400">Premium ${s.premiumPrice.toFixed(2)}</div>
                                  </div>
                                  <Link to={`/booking/${s.id}`}>
                                    <Button size="sm">
                                      Book <ChevronRight className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    );
                  })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
