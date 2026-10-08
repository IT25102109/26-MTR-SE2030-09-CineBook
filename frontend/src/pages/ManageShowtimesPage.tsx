import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, Calendar, Clock, Film, MapPin, Tag, CheckCircle, XCircle, Sparkles, MessageSquare, AlertTriangle, Copy, Shield, Lock, Star, ChevronDown, ChevronUp, Layers, LayoutList, ChevronsUpDown } from 'lucide-react';
import { getShowtimes, getMovies, getBranches, saveShowtime, deleteShowtime, getPromotions, savePromotion, deletePromotion, getAllReviewsForModeration, updateReviewStatus, deleteReview, STORE_EVENTS } from '@/data/store';
import { useStoreSync } from '@/hooks/useStoreSync';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import type { Showtime, Promotion, MovieReview } from '@/types';

const times = ['10:00 AM', '1:15 PM', '4:30 PM', '7:00 PM', '10:15 PM'];

export function ManageShowtimesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tick, setTick] = useState(0);

  // Auto-sync whenever showtimes, movies, branches, promotions, or reviews mutate
  const storeTick = useStoreSync([
    STORE_EVENTS.showtimes,
    STORE_EVENTS.movies,
    STORE_EVENTS.branches,
    STORE_EVENTS.promotions,
    STORE_EVENTS.reviews,
  ]);

  const showtimes = useMemo(() => getShowtimes(), [tick, storeTick]);
  const movies = useMemo(() => getMovies(), [storeTick]);
  const branches = useMemo(() => getBranches(), [storeTick]);
  const promotions = useMemo(() => getPromotions(), [tick, storeTick]);
  const reviews = useMemo(() => getAllReviewsForModeration(), [tick, storeTick]);

  // Extract all unique genres across movies
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach(m => m.genre?.forEach(g => set.add(g)));
    return Array.from(set).sort();
  }, [movies]);

  const [reviewFilter, setReviewFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const pendingReviewsCount = useMemo(() => reviews.filter(r => r.status === 'pending').length, [reviews]);
  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'all') return reviews;
    return reviews.filter(r => r.status === reviewFilter);
  }, [reviews, reviewFilter]);

  const isCinemaManager = user?.role === 'cinemaManager';
  const assignedBranchId = user?.assignedBranchId;
  const initialBranchId = (isCinemaManager && assignedBranchId) ? assignedBranchId : (branches[0]?.id || '');

  const [search, setSearch] = useState('');
  const [movieFilter, setMovieFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState(isCinemaManager && assignedBranchId ? assignedBranchId : 'all');
  const [modalOpen, setModalOpen] = useState(false);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Showtime | null>(null);

  // Bulk clone state
  const [cloneSourceDate, setCloneSourceDate] = useState(new Date().toISOString().split('T')[0]);
  const [cloneTargetDays, setCloneTargetDays] = useState(1);
  const [cloneBranchId, setCloneBranchId] = useState(initialBranchId);

  // View mode & Film Accordion categorization states
  const [viewMode, setViewMode] = useState<'byFilm' | 'table'>('byFilm');
  const [expandedMovieIds, setExpandedMovieIds] = useState<Set<string>>(() => new Set());
  const [includeUnscheduled, setIncludeUnscheduled] = useState(false);

  // Add Showtime form & multi-slot state
  const [modalGenreFilter, setModalGenreFilter] = useState('all');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([times[0]]);
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [repeatDays, setRepeatDays] = useState(1);
  const [keepModalOpen, setKeepModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    movieId: movies[0]?.id || '',
    branchId: initialBranchId,
    hallId: branches.find(b => b.id === initialBranchId)?.halls[0]?.id || branches[0]?.halls[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    basePrice: 14.99,
    premiumPrice: 22.99,
  });

  // Movies filtered by modal genre dropdown
  const modalFilteredMovies = useMemo(() => {
    if (modalGenreFilter === 'all') return movies;
    return movies.filter(m => m.genre?.includes(modalGenreFilter));
  }, [movies, modalGenreFilter]);

  // Selected movie object
  const selectedMovie = useMemo(() => {
    return movies.find(m => m.id === formData.movieId) || modalFilteredMovies[0];
  }, [movies, formData.movieId, modalFilteredMovies]);

  // Promo form state
  const [newPromo, setNewPromo] = useState<Omit<Promotion, 'id'>>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 15,
    minSpend: 25,
    validUntil: '2026-12-31',
    active: true,
  });

  // Dynamic Pricing Checker
  const isWeekend = (dateStr: string) => {
    try {
      const day = new Date(dateStr).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    } catch {
      return false;
    }
  };

  const isPeakHour = (timeStr: string) => {
    return timeStr.includes('7:00 PM') || timeStr.includes('10:15 PM') || timeStr.startsWith('17') || timeStr.startsWith('18') || timeStr.startsWith('19') || timeStr.startsWith('20') || timeStr.startsWith('21') || timeStr.startsWith('22');
  };

  const parseTimeToMinutes = (t: string) => {
    if (!t) return 0;
    const isPM = t.toLowerCase().includes('pm');
    const isAM = t.toLowerCase().includes('am');
    const clean = t.replace(/(am|pm)/i, '').trim();
    const [hStr, mStr] = clean.split(':');
    let h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h * 60 + m;
  };

  // Planned slots across dates and selected times
  const plannedSlots = useMemo(() => {
    if (!formData.date || selectedTimes.length === 0) return [];
    const baseDate = new Date(formData.date + 'T00:00:00');
    const slots: Array<{ date: string; time: string }> = [];
    for (let day = 0; day < repeatDays; day++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + day);
      const dateStr = d.toISOString().split('T')[0];
      for (const time of selectedTimes) {
        slots.push({ date: dateStr, time });
      }
    }
    return slots;
  }, [formData.date, selectedTimes, repeatDays]);

  // Batch conflict calculation
  const { validSlots, conflictingSlots } = useMemo(() => {
    if (!modalOpen || !formData.branchId || !formData.hallId || plannedSlots.length === 0) {
      return { validSlots: plannedSlots, conflictingSlots: [] };
    }

    const valid: Array<{ date: string; time: string }> = [];
    const conflicting: Array<{
      date: string;
      time: string;
      existingMovie: string;
      existingTime: string;
      hallName: string;
    }> = [];

    const branchObj = branches.find(b => b.id === formData.branchId);
    const hallObj = branchObj?.halls.find(h => h.id === formData.hallId);
    const hallName = hallObj?.name || 'Selected Hall';

    for (const slot of plannedSlots) {
      const formMins = parseTimeToMinutes(slot.time);
      const sameHallShows = showtimes.filter(s =>
        s.branchId === formData.branchId &&
        s.hallId === formData.hallId &&
        s.date === slot.date
      );

      let hasConflict = false;
      for (const existing of sameHallShows) {
        const existingMins = parseTimeToMinutes(existing.time);
        if (Math.abs(formMins - existingMins) < 150) {
          const existingMovie = movies.find(m => m.id === existing.movieId);
          conflicting.push({
            date: slot.date,
            time: slot.time,
            existingMovie: existingMovie?.title || 'Another Movie',
            existingTime: existing.time,
            hallName,
          });
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        valid.push(slot);
      }
    }

    return { validSlots: valid, conflictingSlots: conflicting };
  }, [modalOpen, formData.branchId, formData.hallId, plannedSlots, showtimes, movies, branches]);

  const toggleTimeSlot = (time: string) => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const handleAddCustomTime = () => {
    const clean = customTimeInput.trim();
    if (!clean) return;
    if (!selectedTimes.includes(clean)) {
      setSelectedTimes(prev => [...prev, clean]);
    }
    setCustomTimeInput('');
  };

  const handleBulkClone = async () => {
    const sourceShows = showtimes.filter(s =>
      s.date === cloneSourceDate &&
      (!cloneBranchId || cloneBranchId === 'all' || s.branchId === cloneBranchId)
    );

    if (sourceShows.length === 0) {
      toast('error', `No scheduled screenings found on ${cloneSourceDate} to clone.`);
      return;
    }

    const sourceDateObj = new Date(cloneSourceDate + 'T00:00:00');
    let clonedCount = 0;

    for (let dayOffset = 1; dayOffset <= cloneTargetDays; dayOffset++) {
      const targetDateObj = new Date(sourceDateObj);
      targetDateObj.setDate(targetDateObj.getDate() + dayOffset);
      const targetDateStr = targetDateObj.toISOString().split('T')[0];

      for (const s of sourceShows) {
        const newShow: Showtime = {
          id: '',
          movieId: s.movieId,
          branchId: s.branchId,
          hallId: s.hallId,
          date: targetDateStr,
          time: s.time,
          basePrice: s.basePrice,
          premiumPrice: s.premiumPrice,
          bookedSeats: [],
        };
        try {
          await saveShowtime(newShow);
          clonedCount++;
        } catch {
          // ignore
        }
      }
    }

    setCloneModalOpen(false);
    setTick(t => t + 1);
    toast('success', `Successfully cloned ${clonedCount} showtime(s) across next ${cloneTargetDays} day(s)!`);
  };

  const filtered = showtimes.filter(s => {
    if (movieFilter !== 'all' && s.movieId !== movieFilter) return false;
    if (branchFilter !== 'all' && s.branchId !== branchFilter) return false;
    if (genreFilter !== 'all') {
      const movie = movies.find(m => m.id === s.movieId);
      if (!movie || !movie.genre?.includes(genreFilter)) return false;
    }
    if (search) {
      const movie = movies.find(m => m.id === s.movieId);
      if (!movie?.title.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const getMovieTitle = (id: string) => movies.find(m => m.id === id)?.title || 'Unknown';
  const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'Unknown';
  const getHallName = (branchId: string, hallId: string) => {
    const b = branches.find(b => b.id === branchId);
    return b?.halls.find(h => h.id === hallId)?.name || 'Unknown';
  };

  // Group showtimes by movie for the categorized view
  const movieGroups = useMemo(() => {
    // Collect candidate movies based on search, movieFilter, and genreFilter
    const candidates = movies.filter(m => {
      if (movieFilter !== 'all' && m.id !== movieFilter) return false;
      if (genreFilter !== 'all' && !m.genre?.includes(genreFilter)) return false;
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesTitle = m.title.toLowerCase().includes(query);
        const matchesDirector = (m.director || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDirector) return false;
      }
      return true;
    });

    const groups: Array<{
      movie: typeof movies[0];
      showtimes: Showtime[];
      uniqueBranches: Array<{ id: string; name: string }>;
      totalBookedSeats: number;
      dateGroups: Array<{ date: string; slots: Showtime[] }>;
    }> = [];

    const processedMovieIds = new Set<string>();

    candidates.forEach(movie => {
      processedMovieIds.add(movie.id);
      const movieShows = showtimes
        .filter(s => {
          if (s.movieId !== movie.id) return false;
          if (branchFilter !== 'all' && s.branchId !== branchFilter) return false;
          return true;
        })
        .sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
        });

      const branchMap = new Map<string, string>();
      movieShows.forEach(s => {
        const b = branches.find(br => br.id === s.branchId);
        if (b) branchMap.set(b.id, b.name);
      });

      const totalBookedSeats = movieShows.reduce((sum, s) => sum + (s.bookedSeats?.length || 0), 0);

      const dateMap = new Map<string, Showtime[]>();
      movieShows.forEach(s => {
        if (!dateMap.has(s.date)) dateMap.set(s.date, []);
        dateMap.get(s.date)!.push(s);
      });
      const dateGroups = Array.from(dateMap.entries()).map(([date, slots]) => ({
        date,
        slots,
      }));

      groups.push({
        movie,
        showtimes: movieShows,
        uniqueBranches: Array.from(branchMap.entries()).map(([id, name]) => ({ id, name })),
        totalBookedSeats,
        dateGroups,
      });
    });

    // Check for any orphan showtimes with unknown movieId
    showtimes.forEach(s => {
      if (branchFilter !== 'all' && s.branchId !== branchFilter) return;
      if (!processedMovieIds.has(s.movieId) && !movies.some(m => m.id === s.movieId)) {
        processedMovieIds.add(s.movieId);
        const orphanShows = showtimes
          .filter(os => os.movieId === s.movieId && (branchFilter === 'all' || os.branchId === branchFilter))
          .sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
          });
        const syntheticMovie: typeof movies[0] = {
          id: s.movieId,
          title: `Movie #${s.movieId}`,
          synopsis: '',
          poster: '',
          backdrop: '',
          genre: [],
          language: 'English',
          duration: 120,
          rating: 0,
          certification: 'NR',
          director: '',
          cast: [],
          releaseDate: '',
          status: 'now-showing',
          featured: false,
          trailerUrl: '',
        };
        const branchMap = new Map<string, string>();
        orphanShows.forEach(os => {
          const b = branches.find(br => br.id === os.branchId);
          if (b) branchMap.set(b.id, b.name);
        });
        const dateMap = new Map<string, Showtime[]>();
        orphanShows.forEach(os => {
          if (!dateMap.has(os.date)) dateMap.set(os.date, []);
          dateMap.get(os.date)!.push(os);
        });
        groups.push({
          movie: syntheticMovie,
          showtimes: orphanShows,
          uniqueBranches: Array.from(branchMap.entries()).map(([id, name]) => ({ id, name })),
          totalBookedSeats: orphanShows.reduce((sum, os) => sum + (os.bookedSeats?.length || 0), 0),
          dateGroups: Array.from(dateMap.entries()).map(([date, slots]) => ({ date, slots })),
        });
      }
    });

    // Sort: movies with showtimes first (descending count), then alphabetically by title
    return groups.sort((a, b) => {
      if (a.showtimes.length > 0 && b.showtimes.length === 0) return -1;
      if (a.showtimes.length === 0 && b.showtimes.length > 0) return 1;
      if (a.showtimes.length !== b.showtimes.length) return b.showtimes.length - a.showtimes.length;
      return a.movie.title.localeCompare(b.movie.title);
    });
  }, [movies, showtimes, branches, movieFilter, genreFilter, branchFilter, search]);

  const visibleMovieGroups = useMemo(() => {
    if (includeUnscheduled) return movieGroups;
    return movieGroups.filter(g => g.showtimes.length > 0);
  }, [movieGroups, includeUnscheduled]);

  const moviesWithShowtimesCount = useMemo(() => {
    return movieGroups.filter(g => g.showtimes.length > 0).length;
  }, [movieGroups]);

  const unscheduledMoviesCount = useMemo(() => {
    return movieGroups.filter(g => g.showtimes.length === 0).length;
  }, [movieGroups]);

  const totalFilteredBookings = useMemo(() => {
    return filtered.reduce((sum, s) => sum + (s.bookedSeats?.length || 0), 0);
  }, [filtered]);

  const toggleMovieExpanded = (movieId: string) => {
    setExpandedMovieIds(prev => {
      const next = new Set(prev);
      if (next.has(movieId)) {
        next.delete(movieId);
      } else {
        next.add(movieId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedMovieIds(new Set(visibleMovieGroups.map(g => g.movie.id)));
  };

  const handleCollapseAll = () => {
    setExpandedMovieIds(new Set());
  };

  const isMovieExpanded = (movieId: string) => {
    if (search.trim().length > 0) return true;
    if (movieFilter !== 'all' && movieFilter === movieId) return true;
    return expandedMovieIds.has(movieId);
  };

  const handleOpenAddModalForMovie = (movieId: string) => {
    setFormData(prev => ({
      ...prev,
      movieId,
    }));
    setModalGenreFilter('all');
    setModalOpen(true);
  };

  const formatDateHeader = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const availableHalls = branches.find(b => b.id === formData.branchId)?.halls || [];

  const handleBatchSave = async () => {
    const targetMovieId = formData.movieId || modalFilteredMovies[0]?.id || movies[0]?.id;
    if (!targetMovieId || !formData.branchId || !formData.hallId) {
      toast('error', 'Please select a movie, branch, and hall');
      return;
    }
    if (selectedTimes.length === 0) {
      toast('error', 'Please select at least one screening time slot');
      return;
    }
    if (validSlots.length === 0) {
      toast('error', 'All selected showtime slots conflict with existing screenings in this hall');
      return;
    }

    let savedCount = 0;
    for (const slot of validSlots) {
      const showtime: Showtime = {
        id: '',
        movieId: targetMovieId,
        branchId: formData.branchId,
        hallId: formData.hallId,
        date: slot.date,
        time: slot.time,
        basePrice: formData.basePrice,
        premiumPrice: formData.premiumPrice,
        bookedSeats: [],
      };
      try {
        await saveShowtime(showtime);
        savedCount++;
      } catch (err) {
        console.warn('Error saving showtime slot:', err);
      }
    }

    setTick(t => t + 1);
    setExpandedMovieIds(prev => new Set([...prev, targetMovieId]));
    toast(
      'success',
      `Successfully scheduled ${savedCount} showtime${savedCount > 1 ? 's' : ''}${
        repeatDays > 1 ? ` across ${repeatDays} days` : ''
      }!`
    );

    if (keepModalOpen) {
      // Clear times so manager can immediately add more slots for this same hall/branch/movie
      setSelectedTimes([]);
    } else {
      setModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteShowtime(deleteTarget.id);
    setDeleteTarget(null);
    setTick(t => t + 1);
    toast('success', 'Showtime deleted');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-display font-bold">Manage Showtimes</h1>
            {isCinemaManager && assignedBranchId && (
              <Badge variant="blue" className="flex items-center gap-1 text-xs">
                <Shield className="w-3 h-3" /> Branch Manager Scoped
              </Badge>
            )}
          </div>
          <p className="text-text-secondary">Schedule and manage movie showtimes, conflict detection, and promo campaigns</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setCloneModalOpen(true)} className="flex items-center gap-1.5">
            <Copy className="w-4 h-4" /> Bulk Clone
          </Button>
          <Button variant="outline" onClick={() => setReviewsModalOpen(true)} className="flex items-center gap-1.5 relative">
            <MessageSquare className="w-4 h-4 text-accent-primary" /> Review Moderation
            {pendingReviewsCount > 0 ? (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full animate-pulse">
                {pendingReviewsCount} Pending
              </span>
            ) : (
              <span className="text-xs text-text-muted">({reviews.length})</span>
            )}
          </Button>
          <Button variant="outline" onClick={() => setPromoModalOpen(true)} className="flex items-center gap-1.5">
            <Tag className="w-4 h-4" /> Promo Codes ({promotions.length})
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> Add Showtime
          </Button>
        </div>
      </div>

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by movie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-cinema-base border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent-primary/50 transition-all"
            />
          </div>
          <Select value={movieFilter} onChange={e => setMovieFilter(e.target.value)}>
            <option value="all">All Movies</option>
            {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </Select>
          <Select value={genreFilter} onChange={e => setGenreFilter(e.target.value)}>
            <option value="all">All Genres ({allGenres.length})</option>
            {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
          </Select>
          <Select
            value={branchFilter}
            onChange={e => !isCinemaManager && setBranchFilter(e.target.value)}
            disabled={isCinemaManager && !!assignedBranchId}
          >
            {!isCinemaManager && <option value="all">All Branches</option>}
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} {isCinemaManager && b.id === assignedBranchId ? '(Your Branch)' : ''}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* View Mode & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="amber" className="text-xs py-1 px-3">
            <Film className="w-3.5 h-3.5" />
            <span className="font-semibold">{moviesWithShowtimesCount}</span> {moviesWithShowtimesCount === 1 ? 'Film' : 'Films'} with Screenings
          </Badge>
          <Badge variant="blue" className="text-xs py-1 px-3">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-semibold">{filtered.length}</span> Total {filtered.length === 1 ? 'Screening' : 'Screenings'}
          </Badge>
          <Badge variant="green" className="text-xs py-1 px-3">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="font-semibold">{totalFilteredBookings}</span> Booked Seats
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-cinema-base p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('byFilm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'byFilm'
                  ? 'bg-accent-primary text-black font-semibold shadow-soft-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>By Film</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-accent-primary text-black font-semibold shadow-soft-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>All Showtimes (Table)</span>
            </button>
          </div>

          {/* By Film quick controls */}
          {viewMode === 'byFilm' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={expandedMovieIds.size >= visibleMovieGroups.length && visibleMovieGroups.length > 0 ? handleCollapseAll : handleExpandAll}
                className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 h-8 px-2.5 border border-white/10 hover:border-white/20"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
                <span>{expandedMovieIds.size >= visibleMovieGroups.length && visibleMovieGroups.length > 0 ? 'Collapse All' : 'Expand All'}</span>
              </Button>

              {unscheduledMoviesCount > 0 && (
                <button
                  type="button"
                  onClick={() => setIncludeUnscheduled(v => !v)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    includeUnscheduled
                      ? 'bg-accent-primary/15 text-accent-primary border-accent-primary/30 font-medium'
                      : 'bg-cinema-base border-white/10 text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <span>{includeUnscheduled ? 'Hide' : 'Show'} Unscheduled ({unscheduledMoviesCount})</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {viewMode === 'byFilm' ? (
        <div className="space-y-4">
          {visibleMovieGroups.length === 0 ? (
            <div className="py-16 text-center bg-cinema-card rounded-2xl border border-cinema-border">
              <Film className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-semibold text-text-primary mb-1">No Screenings Found</h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto mb-4">
                No movies match your current search and filter settings. Try adjusting your filters or schedule a new showtime.
              </p>
              <Button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-1.5 text-xs">
                <Plus className="w-4 h-4" /> Add Showtime
              </Button>
            </div>
          ) : (
            visibleMovieGroups.map(({ movie, showtimes: shows, uniqueBranches, totalBookedSeats, dateGroups }) => {
              const isExpanded = isMovieExpanded(movie.id);
              return (
                <Card
                  key={movie.id}
                  className="overflow-hidden border border-white/10 hover:border-white/20 transition-all shadow-soft-sm"
                >
                  {/* Film Accordion Header */}
                  <div
                    onClick={() => toggleMovieExpanded(movie.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
                  >
                    {/* Left: Poster + Film Information */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {movie.poster ? (
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-14 h-20 object-cover rounded-xl flex-shrink-0 shadow-md bg-cinema-card border border-white/10"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-14 h-20 rounded-xl bg-cinema-elevated flex items-center justify-center flex-shrink-0 border border-white/10">
                          <Film className="w-6 h-6 text-text-muted" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-lg text-text-primary hover:text-accent-primary transition-colors">
                            {movie.title}
                          </h3>
                          {movie.rating > 0 && (
                            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {movie.rating.toFixed(1)}
                            </span>
                          )}
                          {movie.certification && (
                            <Badge variant="outline" className="text-[10px]">
                              {movie.certification}
                            </Badge>
                          )}
                          <Badge variant={movie.status === 'now-showing' ? 'green' : 'blue'} className="text-[10px]">
                            {movie.status === 'now-showing' ? 'Now Showing' : 'Coming Soon'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-text-secondary mt-1 flex-wrap">
                          {movie.director && <span>Dir: {movie.director}</span>}
                          {movie.director && <span>•</span>}
                          {movie.duration > 0 && <span>{movie.duration} mins</span>}
                          {movie.language && (
                            <>
                              <span>•</span>
                              <span>{movie.language}</span>
                            </>
                          )}
                          {movie.genre && movie.genre.length > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1 flex-wrap">
                                {movie.genre.slice(0, 3).map(g => (
                                  <span key={g} className="px-1.5 py-0.5 rounded bg-white/5 text-text-muted text-[10px] border border-white/5">
                                    {g}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Screening Count & Stats Pills */}
                        <div className="flex items-center gap-3 mt-2.5 text-xs flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 font-semibold ${
                            shows.length > 0 ? 'text-accent-primary' : 'text-text-muted'
                          }`}>
                            <Film className="w-3.5 h-3.5" />
                            {shows.length} {shows.length === 1 ? 'Screening' : 'Screenings'}
                          </span>

                          {uniqueBranches.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-text-muted">
                              <MapPin className="w-3.5 h-3.5" />
                              {uniqueBranches.length} {uniqueBranches.length === 1 ? 'Branch' : 'Branches'} ({uniqueBranches.map(b => b.name).join(', ')})
                            </span>
                          )}

                          {totalBookedSeats > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {totalBookedSeats} Booked {totalBookedSeats === 1 ? 'Seat' : 'Seats'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Add + Expand Chevron */}
                    <div className="flex items-center gap-2.5 flex-shrink-0 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddModalForMovie(movie.id);
                        }}
                        className="text-xs flex items-center gap-1.5 h-8 px-3 hover:border-accent-primary/50"
                      >
                        <Plus className="w-3.5 h-3.5 text-accent-primary" />
                        <span>Add Showtime</span>
                      </Button>

                      <div className={`p-2 rounded-xl bg-white/5 text-text-secondary hover:text-text-primary transition-all duration-200 ${
                        isExpanded ? 'rotate-180 bg-accent-primary/10 text-accent-primary' : ''
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Screenings Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-white/5 bg-cinema-base/40 space-y-5">
                      {shows.length === 0 ? (
                        <div className="p-8 text-center rounded-xl border border-dashed border-white/10 bg-cinema-card/50">
                          <Clock className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
                          <p className="text-sm text-text-secondary font-medium">
                            No showtimes currently scheduled for {movie.title}.
                          </p>
                          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                            Schedule screenings across single or multiple days and halls for this movie.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleOpenAddModalForMovie(movie.id)}
                            className="mt-4 text-xs inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" /> Schedule First Showtime
                          </Button>
                        </div>
                      ) : (
                        <>
                          {dateGroups.map(({ date, slots }) => (
                            <div key={date} className="space-y-2.5">
                              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-1.5">
                                <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                  <Calendar className="w-3.5 h-3.5 text-accent-primary" />
                                  <span>{formatDateHeader(date)}</span>
                                </div>
                                <span className="text-[11px] text-text-muted">
                                  {slots.length} screening{slots.length !== 1 ? 's' : ''}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {slots.map(s => {
                                  const weekend = isWeekend(s.date);
                                  const peak = isPeakHour(s.time);
                                  return (
                                    <div
                                      key={s.id}
                                      className="bg-cinema-card border border-white/10 hover:border-white/20 rounded-xl p-3.5 flex flex-col justify-between gap-3 transition-all hover:shadow-soft-md group"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-primary/10 text-accent-primary rounded-lg font-mono font-bold text-xs border border-accent-primary/20">
                                          <Clock className="w-3 h-3" />
                                          {s.time}
                                        </div>
                                        {weekend && peak ? (
                                          <Badge variant="red" className="text-[10px]">Weekend Peak (+35%)</Badge>
                                        ) : weekend ? (
                                          <Badge variant="amber" className="text-[10px]">Weekend (+20%)</Badge>
                                        ) : peak ? (
                                          <Badge variant="blue" className="text-[10px]">Peak Hour (+15%)</Badge>
                                        ) : (
                                          <Badge variant="default" className="text-[10px]">Standard</Badge>
                                        )}
                                      </div>

                                      <div className="space-y-1 text-xs">
                                        <div className="flex items-center gap-1.5 text-text-primary font-medium">
                                          <MapPin className="w-3 h-3 text-text-muted flex-shrink-0" />
                                          <span className="truncate">{getBranchName(s.branchId)}</span>
                                        </div>
                                        <div className="text-text-secondary pl-5">
                                          Hall: <span className="text-text-primary font-medium">{getHallName(s.branchId, s.hallId)}</span>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="text-accent-primary font-semibold font-mono">${s.basePrice.toFixed(2)}</span>
                                          <Badge variant={s.bookedSeats.length > 0 ? 'amber' : 'default'} className="text-[10px]">
                                            {s.bookedSeats.length} booked
                                          </Badge>
                                        </div>
                                        <button
                                          onClick={() => setDeleteTarget(s)}
                                          className="p-1.5 text-text-muted hover:text-accent-destructive hover:bg-accent-destructive/10 transition-colors rounded-lg cursor-pointer"
                                          title="Delete showtime"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}

                          <div className="pt-2 flex justify-between items-center text-xs text-text-muted border-t border-white/5">
                            <span>Showing {shows.length} screenings across {dateGroups.length} day{dateGroups.length !== 1 ? 's' : ''}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenAddModalForMovie(movie.id)}
                              className="text-xs text-accent-primary hover:bg-accent-primary/10 flex items-center gap-1 h-7 px-2"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add more showtimes for {movie.title}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      ) : (
        <Table
          columns={[
            {
              key: 'movie',
              header: 'Movie',
              render: (s) => {
                const movie = movies.find(m => m.id === s.movieId);
                return (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <span className="font-medium">{movie?.title || getMovieTitle(s.movieId)}</span>
                    </div>
                    {movie?.genre && movie.genre.length > 0 && (
                      <div className="flex flex-wrap gap-1 pl-6">
                        {movie.genre.slice(0, 3).map(g => (
                          <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-text-muted border border-white/5">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              key: 'branch',
              header: 'Branch',
              render: (s) => (
                <span className="text-text-secondary">{getBranchName(s.branchId)}</span>
              ),
            },
            {
              key: 'hall',
              header: 'Hall',
              render: (s) => <span className="text-text-secondary">{getHallName(s.branchId, s.hallId)}</span>,
            },
            {
              key: 'date',
              header: 'Date',
              render: (s) => (
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              ),
            },
            {
              key: 'time',
              header: 'Time',
              render: (s) => (
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <Clock className="w-3.5 h-3.5" />
                  {s.time}
                </span>
              ),
            },
            {
              key: 'seats',
              header: 'Booked',
              render: (s) => (
                <Badge variant={s.bookedSeats.length > 0 ? 'amber' : 'default'}>
                  {s.bookedSeats.length} seats
                </Badge>
              ),
            },
            {
              key: 'pricingTier',
              header: 'Pricing Mode',
              render: (s) => {
                const weekend = isWeekend(s.date);
                const peak = isPeakHour(s.time);
                if (weekend && peak) {
                  return <Badge variant="red">Weekend Peak (+35%)</Badge>;
                } else if (weekend) {
                  return <Badge variant="amber">Weekend (+20%)</Badge>;
                } else if (peak) {
                  return <Badge variant="blue">Peak Hour (+15%)</Badge>;
                }
                return <Badge variant="default">Standard</Badge>;
              },
            },
            {
              key: 'price',
              header: 'Price',
              render: (s) => <span className="text-accent-primary font-medium">${s.basePrice}</span>,
            },
            {
              key: 'actions',
              header: '',
              render: (s) => (
                <button
                  onClick={() => setDeleteTarget(s)}
                  className="text-text-muted hover:text-accent-destructive transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ),
            },
          ]}
          data={filtered}
          emptyMessage="No showtimes found. Add one to get started."
        />
      )}

      {/* Add Showtime Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Showtime(s) • Multi-Schedule"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleBatchSave} disabled={validSlots.length === 0}>
              {validSlots.length === 0
                ? 'No Valid Slots Selected'
                : `Schedule ${validSlots.length} Showtime${validSlots.length > 1 ? 's' : ''}`}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Dynamic Pricing Live Banner */}
          <div className="p-3 rounded-xl bg-cinema-card hairline border border-accent-primary/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-primary flex-shrink-0" />
              <span>
                {isWeekend(formData.date) && selectedTimes.some(t => isPeakHour(t))
                  ? '⚡ Peak Evening + Weekend Surge (+35% automatically factored in backend)'
                  : isWeekend(formData.date)
                  ? '⚡ Weekend Surge (+20% automatically factored in backend)'
                  : selectedTimes.some(t => isPeakHour(t))
                  ? '⚡ Evening Peak Surge (+15% automatically factored in backend)'
                  : 'Standard Off-Peak Weekday Slot'}
              </span>
            </div>
            <Badge variant="amber">Dynamic Engine</Badge>
          </div>

          {/* Genre Filter & Movie Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Filter Movies by Genre"
              value={modalGenreFilter}
              onChange={e => {
                const g = e.target.value;
                setModalGenreFilter(g);
                const matching = g === 'all' ? movies : movies.filter(m => m.genre?.includes(g));
                if (matching.length > 0 && !matching.some(m => m.id === formData.movieId)) {
                  setFormData(prev => ({ ...prev, movieId: matching[0].id }));
                }
              }}
            >
              <option value="all">All Genres ({allGenres.length})</option>
              {allGenres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Select>

            <Select
              label="Movie"
              value={formData.movieId}
              onChange={e => setFormData({ ...formData, movieId: e.target.value })}
            >
              {modalFilteredMovies.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          </div>

          {/* Selected Movie Details Preview */}
          {selectedMovie && (
            <div className="text-xs text-text-secondary flex items-center gap-2 flex-wrap bg-cinema-base/60 p-2.5 rounded-xl border border-white/5">
              <Film className="w-3.5 h-3.5 text-accent-primary" />
              <span className="font-semibold text-text-primary">{selectedMovie.title}</span>
              <span>•</span>
              <span>{selectedMovie.duration} mins</span>
              <span>•</span>
              <span>{selectedMovie.language}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {selectedMovie.genre?.map(g => (
                  <span key={g} className="px-1.5 py-0.5 rounded bg-accent-primary/10 text-accent-primary text-[10px] font-medium">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Branch & Hall Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Branch"
              value={formData.branchId}
              disabled={isCinemaManager && !!assignedBranchId}
              onChange={e => setFormData({
                ...formData,
                branchId: e.target.value,
                hallId: branches.find(b => b.id === e.target.value)?.halls[0]?.id || ''
              })}
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} {isCinemaManager && b.id === assignedBranchId ? '(Assigned to you)' : ''}
                </option>
              ))}
            </Select>
            <Select
              label="Hall"
              value={formData.hallId}
              onChange={e => setFormData({ ...formData, hallId: e.target.value })}
            >
              {availableHalls.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.rows * h.seatsPerRow} seats)
                </option>
              ))}
            </Select>
          </div>

          {/* Date & Multi-Day Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
            <Select
              label="Repeat for Consecutive Days"
              value={repeatDays}
              onChange={e => setRepeatDays(Number(e.target.value))}
            >
              <option value={1}>1 Day (Start date only)</option>
              <option value={2}>2 Days (Today & Tomorrow)</option>
              <option value={3}>3 Days (Next 3 days)</option>
              <option value={5}>5 Days (Weekdays / 5 days)</option>
              <option value={7}>7 Days (Full 1-week run)</option>
              <option value={14}>14 Days (2 weeks)</option>
            </Select>
          </div>

          {/* Multi-Time Slots Selection */}
          <div className="space-y-2 bg-cinema-base/40 p-3 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent-primary" />
                Select Screening Times ({selectedTimes.length} selected
                {repeatDays > 1 ? ` × ${repeatDays} days = ${selectedTimes.length * repeatDays} showtimes` : ''})
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTimes([...times])}
                  className="text-[11px] text-accent-primary hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-text-muted">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedTimes([])}
                  className="text-[11px] text-text-muted hover:text-text-primary cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {times.map(t => {
                const isSelected = selectedTimes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTimeSlot(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-accent-primary text-black font-semibold shadow-soft-sm'
                        : 'bg-cinema-card border border-cinema-border text-text-secondary hover:text-text-primary hover:border-accent-primary/40'
                    }`}
                  >
                    {t}
                    {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
              {selectedTimes.filter(t => !times.includes(t)).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTimeSlot(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent-primary text-black flex items-center gap-1.5 cursor-pointer"
                >
                  {t}
                  <XCircle className="w-3.5 h-3.5 hover:text-red-900" />
                </button>
              ))}
            </div>

            {/* Custom Time Adder */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add custom time (e.g. 11:30 AM or 8:45 PM)"
                value={customTimeInput}
                onChange={e => setCustomTimeInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTime();
                  }
                }}
                className="flex-1 bg-cinema-elevated border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary/50"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddCustomTime}
                className="text-xs px-3"
              >
                + Add Slot
              </Button>
            </div>
          </div>

          {/* Pricing inputs */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Price ($)"
              type="number"
              step="0.01"
              value={formData.basePrice}
              onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Premium Price ($)"
              type="number"
              step="0.01"
              value={formData.premiumPrice}
              onChange={e => setFormData({ ...formData, premiumPrice: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Conflict Warning or Summary */}
          {conflictingSlots.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Scheduling Conflict ({conflictingSlots.length} slot{conflictingSlots.length > 1 ? 's' : ''} occupied)</span>
              </div>
              <p className="text-text-secondary pl-6 leading-relaxed">
                {validSlots.length > 0
                  ? `${validSlots.length} available slot(s) will still be safely scheduled. ${conflictingSlots.length} overlapping slot(s) will be automatically skipped.`
                  : 'All selected time slots overlap with existing screenings (2.5h hall turnaround needed). Please pick different times.'}
              </p>
              <div className="pl-6 pt-1 text-[11px] text-amber-400/80">
                Example conflict: {conflictingSlots[0]?.date} at {conflictingSlots[0]?.time} occupied by "{conflictingSlots[0]?.existingMovie}"
              </div>
            </div>
          )}

          {/* Keep Modal Open Checkbox */}
          <div className="pt-2 border-t border-cinema-border">
            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer hover:text-text-primary select-none">
              <input
                type="checkbox"
                checked={keepModalOpen}
                onChange={e => setKeepModalOpen(e.target.checked)}
                className="rounded border-white/20 text-accent-primary focus:ring-accent-primary/30"
              />
              <span>Keep dialog open after saving (rapid multi-slot scheduling for this branch/hall)</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Promotions & Discount Codes Modal */}
      <Modal
        open={promoModalOpen}
        onClose={() => setPromoModalOpen(false)}
        title="Promotions & Discount Campaigns"
        size="lg"
        footer={<Button variant="ghost" onClick={() => setPromoModalOpen(false)}>Close</Button>}
      >
        <div className="space-y-6">
          <div className="bg-cinema-card hairline p-4 rounded-xl space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5"><Tag className="w-4 h-4 text-accent-primary" /> Create New Promo Code</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Code"
                placeholder="e.g. SUMMER20"
                value={newPromo.code}
                onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
              />
              <Select
                label="Discount Type"
                value={newPromo.discountType}
                onChange={e => setNewPromo({ ...newPromo, discountType: e.target.value as 'percentage' | 'flat' })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Dollar ($)</option>
              </Select>
              <Input
                label="Value"
                type="number"
                value={newPromo.discountValue}
                onChange={e => setNewPromo({ ...newPromo, discountValue: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Description"
                placeholder="e.g. 20% off all orders over $30"
                value={newPromo.description}
                onChange={e => setNewPromo({ ...newPromo, description: e.target.value })}
              />
              <Input
                label="Valid Until"
                type="date"
                value={newPromo.validUntil}
                onChange={e => setNewPromo({ ...newPromo, validUntil: e.target.value })}
              />
            </div>
            <Button
              onClick={() => {
                if (!newPromo.code.trim()) {
                  toast('error', 'Please enter a promo code');
                  return;
                }
                savePromotion({
                  id: `p_${Date.now()}`,
                  ...newPromo,
                });
                setNewPromo({
                  code: '',
                  description: '',
                  discountType: 'percentage',
                  discountValue: 15,
                  minSpend: 25,
                  validUntil: '2026-12-31',
                  active: true,
                });
                setTick(t => t + 1);
                toast('success', 'Promotion code created!');
              }}
              size="sm"
            >
              Add Promotion
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-text-secondary uppercase">Active Promo Campaigns</h4>
            <div className="divide-y divide-white/5">
              {promotions.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-accent-primary">{p.code}</span>
                      <Badge variant="default">{p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `$${p.discountValue} OFF`}</Badge>
                      <span className="text-xs text-text-muted">Exp: {p.validUntil}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{p.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      deletePromotion(p.id);
                      setTick(t => t + 1);
                      toast('success', 'Promotion deleted');
                    }}
                    className="text-text-muted hover:text-accent-destructive p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Review Moderation Modal */}
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
              Approved ({reviews.filter(r => r.status === 'approved').length})
            </button>
            <button
              onClick={() => setReviewFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                reviewFilter === 'rejected'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              Rejected ({reviews.filter(r => r.status === 'rejected').length})
            </button>
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                reviewFilter === 'all'
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              All ({reviews.length})
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
                            setTick(t => t + 1);
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
                            setTick(t => t + 1);
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
                          setTick(t => t + 1);
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

      {/* Bulk Clone Schedule Modal */}
      <Modal
        open={cloneModalOpen}
        onClose={() => setCloneModalOpen(false)}
        title="Bulk Clone Showtimes Schedule"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCloneModalOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkClone} className="flex items-center gap-1.5">
              <Copy className="w-4 h-4" /> Clone Schedule
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Duplicate a full day's scheduled screenings across future dates in one click. Great for rolling forward recurring schedules to the coming days or whole week.
          </p>

          <Select
            label="Branch"
            value={cloneBranchId}
            disabled={isCinemaManager && !!assignedBranchId}
            onChange={e => setCloneBranchId(e.target.value)}
          >
            {!isCinemaManager && <option value="all">All Cinema Branches</option>}
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} {isCinemaManager && b.id === assignedBranchId ? '(Your Branch)' : ''}
              </option>
            ))}
          </Select>

          <Input
            label="Source Schedule Date (Copy from)"
            type="date"
            value={cloneSourceDate}
            onChange={e => setCloneSourceDate(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Replicate to Next
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { days: 1, label: '1 Day (Tomorrow)' },
                { days: 3, label: '3 Days' },
                { days: 7, label: '7 Days (Whole Week)' },
              ].map(opt => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setCloneTargetDays(opt.days)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    cloneTargetDays === opt.days
                      ? 'bg-accent-primary text-white border-accent-primary shadow-md shadow-accent-primary/20'
                      : 'bg-cinema-base text-text-secondary border-white/10 hover:border-white/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Showtime?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Delete showtime for <span className="font-medium text-text-primary">{deleteTarget && getMovieTitle(deleteTarget.movieId)}</span> on{' '}
          {deleteTarget && new Date(deleteTarget.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {deleteTarget?.time}?
        </p>
      </Modal>
    </div>
  );
}

