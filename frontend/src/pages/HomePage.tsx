import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, Calendar } from 'lucide-react';
import { HeroCarousel } from '@/components/movies/HeroCarousel';
import { MovieCard } from '@/components/movies/MovieCard';
import { getMovies, getBranches } from '@/data/store';

export function HomePage() {
  const movies = useMemo(() => getMovies(), []);
  const branches = useMemo(() => getBranches(), []);

  const featured = movies.filter(m => m.featured);
  const nowShowing = movies.filter(m => m.status === 'now-showing');
  const comingSoon = movies.filter(m => m.status === 'coming-soon');

  return (
    <div>
      <HeroCarousel movies={featured} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">Now Showing</h2>
                <p className="text-sm text-text-secondary">Catch these films on the big screen today</p>
              </div>
            </div>
            <Link to="/movies" className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent-primary transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {nowShowing.slice(0, 5).map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">Coming Soon</h2>
                <p className="text-sm text-text-secondary">Mark your calendar for these upcoming releases</p>
              </div>
            </div>
            <Link to="/movies?filter=coming-soon" className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent-primary transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {comingSoon.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Our Cinemas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {branches.map((branch, i) => (
              <Link
                key={branch.id}
                to="/movies"
                className="group bg-cinema-card hairline rounded-2xl p-6 hover:bg-cinema-elevated hover:border-accent-primary/20 transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 flex items-center justify-center">
                    <span className="text-lg font-display font-bold text-accent-primary">
                      {branch.name.split(' ').pop()?.[0] || 'C'}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-primary transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-1">{branch.name}</h3>
                <p className="text-sm text-text-secondary mb-3">{branch.address}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">{branch.halls.length} Screens</span>
                  <span className="text-text-muted">•</span>
                  <span className="text-xs text-text-muted">{branch.city}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
