import { useMemo, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Sparkles, CalendarDays, RotateCcw, Bookmark } from 'lucide-react';
import { getMovies, getBranches, getShowtimes, isMovieWishlisted } from '@/data/store';
import { useAuth } from '@/contexts/AuthContext';
import { MovieCard } from '@/components/movies/MovieCard';
import { Select } from '@/components/ui/Input';

export function MoviesPage() {
  const { user } = useAuth();

  if (user?.role === 'cinemaManager' || user?.role === 'admin') {
    return <Navigate to="/manage/movies" replace />;
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const allMovies = useMemo(() => getMovies(), []);
  const branches = useMemo(() => getBranches(), []);
  const showtimes = useMemo(() => getShowtimes(), []);

  const [search, setSearch] = useState('');
  const statusFilter = searchParams.get('filter') || 'all';
  const [genreFilter, setGenreFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');

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
      if (statusFilter === 'wishlist') {
        if (!user || !isMovieWishlisted(user.id, m.id)) return false;
      } else if (statusFilter !== 'all' && m.status !== statusFilter) {
        return false;
      }
      if (genreFilter !== 'all' && !m.genre.includes(genreFilter)) return false;
      if (languageFilter !== 'all' && m.language !== languageFilter) return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;

      // Filter by Cinema Branch
      if (branchFilter !== 'all') {
        const hasShowtimeInBranch = showtimes.some(s => s.movieId === m.id && s.branchId === branchFilter);
        if (!hasShowtimeInBranch) return false;
      }

      // Filter by Screening Format (2D, 3D, IMAX, 4DX)
      if (formatFilter !== 'all') {
        if (formatFilter === 'IMAX') {
          const isImax = m.title.includes('Dune') || m.title.includes('Oppenheimer') || m.title.includes('Interstellar');
          if (!isImax) return false;
        } else if (formatFilter === '3D') {
          const is3d = m.genre.includes('Action') || m.genre.includes('Sci-Fi') || m.title.includes('Spider-Man');
          if (!is3d) return false;
        } else if (formatFilter === '4DX') {
          const is4dx = m.genre.includes('Action') || m.title.includes('Apes') || m.title.includes('Furiosa');
          if (!is4dx) return false;
        }
      }

      // Filter by Release Date Range
      if (dateRangeFilter !== 'all') {
        const releaseYear = new Date(m.releaseDate).getFullYear();
        const currentYear = new Date().getFullYear();
        if (dateRangeFilter === 'this-year' && releaseYear !== currentYear) return false;
        if (dateRangeFilter === 'classic' && releaseYear >= currentYear) return false;
      }

      return true;
    });
  }, [allMovies, statusFilter, genreFilter, languageFilter, branchFilter, formatFilter, dateRangeFilter, search, showtimes, user]);

  const setStatusFilter = (val: string) => {
    if (val === 'all') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', val);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearch('');
    setGenreFilter('all');
    setLanguageFilter('all');
    setBranchFilter('all');
    setFormatFilter('all');
    setDateRangeFilter('all');
    setSearchParams({});
  };

  const hasActiveFilters = search || statusFilter !== 'all' || genreFilter !== 'all' || languageFilter !== 'all' || branchFilter !== 'all' || formatFilter !== 'all' || dateRangeFilter !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-display font-bold mb-2">Browse Movies</h1>
        <p className="text-text-secondary">Discover what's playing and coming soon across CineBook cinema branches</p>
      </div>

      {/* Quick Category / Status Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'all'
              ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/25'
              : 'bg-cinema-card text-text-secondary hover:text-text-primary hover:bg-cinema-elevated hairline'
          }`}
        >
          All Movies
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('now-showing')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'now-showing'
              ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/25'
              : 'bg-cinema-card text-text-secondary hover:text-text-primary hover:bg-cinema-elevated hairline'
          }`}
        >
          Now Showing
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('coming-soon')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'coming-soon'
              ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/25'
              : 'bg-cinema-card text-text-secondary hover:text-text-primary hover:bg-cinema-elevated hairline'
          }`}
        >
          Coming Soon
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('wishlist')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'wishlist'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
              : 'bg-cinema-card text-text-secondary hover:text-amber-500 hover:bg-cinema-elevated hairline'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" /> My Wishlist
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-cinema-card hairline rounded-2xl p-4 sm:p-5 mb-8 animate-fade-in-up">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by movie title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-cinema-base border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 transition-all"
            />
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Release Status</option>
            <option value="now-showing">Now Showing</option>
            <option value="coming-soon">Coming Soon</option>
            <option value="wishlist">Saved in Wishlist ⭐</option>
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

        {/* Multi-attribute secondary filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-text-muted flex-shrink-0" />
            <Select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
              <option value="all">All Cinema Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-text-muted flex-shrink-0" />
            <Select value={formatFilter} onChange={e => setFormatFilter(e.target.value)}>
              <option value="all">All Screening Formats</option>
              <option value="2D">Standard 2D</option>
              <option value="3D">Digital 3D</option>
              <option value="IMAX">IMAX Experience</option>
              <option value="4DX">4DX Motion & Effects</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-text-muted flex-shrink-0" />
            <Select value={dateRangeFilter} onChange={e => setDateRangeFilter(e.target.value)}>
              <option value="all">All Release Dates</option>
              <option value="this-year">Released This Year</option>
              <option value="classic">Past Releases</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mb-5 text-sm text-text-secondary flex-wrap">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          <span>{filtered.length} {filtered.length === 1 ? 'movie' : 'movies'} found</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-accent-primary hover:underline"
          >
            <RotateCcw className="w-3 h-3" /> Reset all filters
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {filtered.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-cinema-card hairline rounded-2xl">
          <p className="text-text-muted text-lg mb-2">No movies match your selected filters.</p>
          <button
            onClick={clearFilters}
            className="mt-2 text-accent-primary text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
