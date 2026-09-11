import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Film } from 'lucide-react';
import { store } from '@/data/store';
import type { Movie } from '@/types';
import { MovieCard } from '@/components/MovieCard';
import { Select } from '@/components/ui/Input';

export function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [genre, setGenre] = useState('all');
  const [language, setLanguage] = useState('all');
  const [status, setStatus] = useState(searchParams.get('status') ?? 'all');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    setMovies(store.getMovies());
  }, []);

  const allGenres = useMemo(() => Array.from(new Set(movies.flatMap((m) => m.genres))).sort(), [movies]);
  const allLanguages = useMemo(() => Array.from(new Set(movies.map((m) => m.language))).sort(), [movies]);

  const filtered = useMemo(() => {
    let result = movies;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q) || m.cast.some((c) => c.toLowerCase().includes(q)) || m.director.toLowerCase().includes(q));
    }
    if (genre !== 'all') result = result.filter((m) => m.genres.includes(genre));
    if (language !== 'all') result = result.filter((m) => m.language === language);
    if (status !== 'all') result = result.filter((m) => m.status === status);

    result = [...result].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'release') return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
      return 0;
    });
    return result;
  }, [movies, query, genre, language, status, sortBy]);

  const updateQuery = (v: string) => {
    setQuery(v);
    setSearchParams(v ? { q: v } : {});
  };

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Movies</h1>
        <p className="text-ink-400">Discover what's showing and what's coming to a cinema near you.</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
        <input
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          placeholder="Search by title, cast, or director..."
          className="w-full bg-ink-850 border border-ink-600 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="flex items-center gap-2 text-sm text-ink-400 mr-2">
          <SlidersHorizontal className="w-4 h-4" /> Filters:
        </div>
        <div className="w-40">
          <Select value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="all">All Genres</option>
            {allGenres.map((g) => <option key={g} value={g}>{g}</option>)}
          </Select>
        </div>
        <div className="w-36">
          <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="all">All Languages</option>
            {allLanguages.map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>
        </div>
        <div className="w-40">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="now_showing">Now Showing</option>
            <option value="coming_soon">Coming Soon</option>
          </Select>
        </div>
        <div className="w-36">
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="rating">Sort: Rating</option>
            <option value="title">Sort: Title A-Z</option>
            <option value="release">Sort: Release Date</option>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-ink-400">{filtered.length} movie{filtered.length !== 1 ? 's' : ''} found</div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Film className="w-16 h-16 text-ink-600 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No movies found</h3>
          <p className="text-ink-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filtered.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
        </div>
      )}
    </div>
  );
}
