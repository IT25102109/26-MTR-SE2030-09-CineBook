import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Calendar, ChevronLeft, ChevronRight, Play, ArrowRight } from 'lucide-react';
import { store } from '@/data/store';
import type { Movie } from '@/types';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setMovies(store.getMovies());
  }, []);

  const featured = useMemo(() => movies.filter((m) => m.featured), [movies]);
  const nowShowing = useMemo(() => movies.filter((m) => m.status === 'now_showing'), [movies]);
  const comingSoon = useMemo(() => movies.filter((m) => m.status === 'coming_soon'), [movies]);

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % featured.length), 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (movies.length === 0) {
    return <div className="container-app py-20 text-center text-ink-400">Loading...</div>;
  }

  const hero = featured[current];

  return (
    <div>
      {/* Hero carousel */}
      {hero && (
        <section className="relative h-[70vh] min-h-[480px] overflow-hidden">
          {featured.map((m, i) => (
            <div
              key={m.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <img src={m.backdropUrl} alt={m.title} className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-ink-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/50 to-transparent" />

          <div className="relative container-app h-full flex items-end pb-16">
            <div className="max-w-2xl animate-fade-in" key={hero.id}>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="accent">Featured</Badge>
                <Badge variant="gold"><Star className="w-3 h-3 fill-gold" /> {hero.rating.toFixed(1)}</Badge>
                {hero.genres.map((g) => <Badge key={g} variant="outline">{g}</Badge>)}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-3">{hero.title}</h1>
              <p className="text-ink-200 text-base md:text-lg leading-relaxed mb-5 line-clamp-3">{hero.synopsis}</p>
              <div className="flex items-center gap-4 text-sm text-ink-300 mb-6">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {hero.durationMin}m</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(hero.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>{hero.language}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={`/movies/${hero.id}`}>
                  <Button size="lg"><Play className="w-4 h-4 fill-white" /> Book Now</Button>
                </Link>
                <Link to={`/movies/${hero.id}`}>
                  <Button variant="outline" size="lg">View Details</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Carousel controls */}
          {featured.length > 1 && (
            <>
              <button
                onClick={() => setCurrent((c) => (c - 1 + featured.length) % featured.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrent((c) => (c + 1) % featured.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-6 right-8 flex gap-2">
                {featured.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-1.5 rounded-full transition-all ${i === current ? 'w-8 bg-accent' : 'w-2 bg-ink-500'}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Now Showing */}
      <section className="container-app py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Now Showing</h2>
          <Link to="/movies" className="text-sm text-accent hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {nowShowing.slice(0, 10).map((m, i) => (
            <MovieCard key={m.id} movie={m} index={i} />
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      {comingSoon.length > 0 && (
        <section className="container-app py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Coming Soon</h2>
            <Link to="/movies?status=coming_soon" className="text-sm text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {comingSoon.map((m, i) => (
              <MovieCard key={m.id} movie={m} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Promo banner */}
      <section className="container-app py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent/20 via-ink-850 to-gold/10 border border-white/5 p-8 md:p-12">
          <div className="relative z-10 max-w-lg">
            <Badge variant="gold" className="mb-3">CineBook Rewards</Badge>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Book 5 movies, get 1 free</h3>
            <p className="text-ink-300 mb-5">Every ticket you book earns points. Collect 500 points and unlock a free ticket to any showing.</p>
            <Link to="/movies"><Button variant="gold">Start Earning</Button></Link>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute right-20 bottom-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl translate-y-1/3" />
        </div>
      </section>
    </div>
  );
}
