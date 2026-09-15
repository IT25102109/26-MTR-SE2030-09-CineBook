import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getMovies } from '@/data/store';
import { MovieCard } from '@/components/movies/MovieCard';
import { Input, Select } from '@/components/ui/Input';

export function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const allMovies = useMemo(() => getMovies(), []);

  const [search, setSearch] = useState('');
  const statusFilter = searchParams.get('filter') || 'all';
  const [genreFilter, setGenreFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');

  const genres = useMemo(() => {
    const set = new Set<string>();
    allMovies.forEach(m => m.genre.forEach(g => set.add(g)));
    return Array.from(set).sort();
  }, [allMovies]);

  const languages = useMemo(() => {
    return Array.from(new Set(allMovies.map(m => m.language))).sort();
  }, [allMovies]);

  const filtered = useMemo(() => {
    return allMovies.filter(m => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (genreFilter !== 'all' && !m.genre.includes(genreFilter)) return false;
      if (languageFilter !== 'all' && m.language !== languageFilter) return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allMovies, statusFilter, genreFilter, languageFilter, search]);

  const setStatusFilter = (val: string) => {
    if (val === 'all') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', val);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-display font-bold mb-2">Browse Movies</h1>
        <p className="text-text-secondary">Discover what's playing and what's coming to a cinema near you</p>
      </div>

      <div className="bg-cinema-card hairline rounded-2xl p-4 sm:p-5 mb-8 animate-fade-in-up">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-cinema-base border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 transition-all"
            />
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Movies</option>
            <option value="now-showing">Now Showing</option>
            <option value="coming-soon">Coming Soon</option>
          </Select>
          <Select value={genreFilter} onChange={e => setGenreFilter(e.target.value)}>
            <option value="all">All Genres</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </Select>
          <Select value={languageFilter} onChange={e => setLanguageFilter(e.target.value)}>
            <option value="all">All Languages</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 text-sm text-text-secondary">
        <SlidersHorizontal className="w-4 h-4" />
        <span>{filtered.length} {filtered.length === 1 ? 'movie' : 'movies'} found</span>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {filtered.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg">No movies match your filters</p>
          <button
            onClick={() => { setSearch(''); setGenreFilter('all'); setLanguageFilter('all'); setSearchParams({}); }}
            className="mt-4 text-accent-primary text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
