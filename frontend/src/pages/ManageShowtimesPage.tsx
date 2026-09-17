import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, Calendar, Clock, Film, MapPin, Tag, CheckCircle, XCircle, Sparkles, MessageSquare, AlertTriangle, Copy, Shield, Lock, Star } from 'lucide-react';
import { getShowtimes, getMovies, getBranches, saveShowtime, deleteShowtime, getPromotions, savePromotion, deletePromotion, getAllReviewsForModeration, updateReviewStatus, deleteReview } from '@/data/store';
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

  const showtimes = useMemo(() => getShowtimes(), [tick]);
  const movies = useMemo(() => getMovies(), []);
  const branches = useMemo(() => getBranches(), []);
  const promotions = useMemo(() => getPromotions(), [tick]);
  const reviews = useMemo(() => getAllReviewsForModeration(), [tick]);

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

  const [formData, setFormData] = useState({
    movieId: movies[0]?.id || '',
    branchId: initialBranchId,
    hallId: branches.find(b => b.id === initialBranchId)?.halls[0]?.id || branches[0]?.halls[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: times[0],
    basePrice: 14.99,
    premiumPrice: 22.99,
  });

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

  const conflictWarning = useMemo(() => {
    if (!modalOpen || !formData.branchId || !formData.hallId || !formData.date || !formData.time) {
      return null;
    }
    const formMins = parseTimeToMinutes(formData.time);
    const sameHallShows = showtimes.filter(s =>
      s.branchId === formData.branchId &&
      s.hallId === formData.hallId &&
      s.date === formData.date
    );
    for (const existing of sameHallShows) {
      const existingMins = parseTimeToMinutes(existing.time);
      if (Math.abs(formMins - existingMins) < 150) { // 2.5h buffer slot
        const existingMovie = movies.find(m => m.id === existing.movieId);
        const branchObj = branches.find(b => b.id === existing.branchId);
        const hallObj = branchObj?.halls.find(h => h.id === existing.hallId);
        return {
          existingTime: existing.time,
          movieTitle: existingMovie?.title || 'Another Movie',
          hallName: hallObj?.name || 'Selected Hall',
        };
      }
    }
    return null;
  }, [modalOpen, formData.branchId, formData.hallId, formData.date, formData.time, showtimes, movies, branches]);

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

  const availableHalls = branches.find(b => b.id === formData.branchId)?.halls || [];

  const handleSave = async () => {
    if (!formData.movieId || !formData.branchId || !formData.hallId) {
      toast('error', 'Please select a movie, branch, and hall');
      return;
    }
    if (conflictWarning) {
      toast('error', `Scheduling Conflict: Hall is already occupied by "${conflictWarning.movieTitle}" at ${conflictWarning.existingTime}`);
      return;
    }
    const showtime: Showtime = {
      id: '',
      ...formData,
      bookedSeats: [],
    };
    try {
      const saved = await saveShowtime(showtime);
      setModalOpen(false);
      setTick(t => t + 1);
      if (saved.id && !saved.id.startsWith('s')) {
        toast('success', `Showtime #${saved.id} synced with MySQL database!`);
      } else {
        toast('success', 'Showtime added successfully');
      }
    } catch {
      setModalOpen(false);
      setTick(t => t + 1);
      toast('info', 'Showtime added locally (backend sync pending)');
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      <div className="mb-4 text-sm text-text-secondary">
        {filtered.length} showtime{filtered.length !== 1 ? 's' : ''} found
      </div>

      <Table
        columns={[
          {
            key: 'movie',
            header: 'Movie',
            render: (s) => (
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-text-muted flex-shrink-0" />
                <span className="font-medium">{getMovieTitle(s.movieId)}</span>
              </div>
            ),
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

      {/* Add Showtime Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Showtime"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!!conflictWarning}>
              {conflictWarning ? 'Cannot Add (Conflict)' : 'Add Showtime'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Conflict Warning Banner */}
          {conflictWarning && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Scheduling Conflict Detected!</p>
                <p className="text-text-secondary mt-0.5 leading-relaxed">
                  "{conflictWarning.movieTitle}" is already scheduled in {conflictWarning.hallName} at {conflictWarning.existingTime}.
                  Cinema halls require a 2.5h turnaround slot to prevent overlapping screenings.
                </p>
              </div>
            </div>
          )}

          {/* Dynamic Pricing Live Banner */}
          <div className="p-3 rounded-xl bg-cinema-card hairline border border-accent-primary/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-primary flex-shrink-0" />
              <span>
                {isWeekend(formData.date) && isPeakHour(formData.time)
                  ? '⚡ Peak Evening + Weekend Surge (+35% automatically factored in backend)'
                  : isWeekend(formData.date)
                  ? '⚡ Weekend Surge (+20% automatically factored in backend)'
                  : isPeakHour(formData.time)
                  ? '⚡ Evening Peak Surge (+15% automatically factored in backend)'
                  : 'Standard Off-Peak Weekday Slot'}
              </span>
            </div>
            <Badge variant="amber">Dynamic Engine</Badge>
          </div>

          <Select label="Movie" value={formData.movieId} onChange={e => setFormData({ ...formData, movieId: e.target.value })}>
            {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </Select>
          <Select
            label="Branch"
            value={formData.branchId}
            disabled={isCinemaManager && !!assignedBranchId}
            onChange={e => setFormData({ ...formData, branchId: e.target.value, hallId: branches.find(b => b.id === e.target.value)?.halls[0]?.id || '' })}
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} {isCinemaManager && b.id === assignedBranchId ? '(Assigned to you)' : ''}
              </option>
            ))}
          </Select>
          <Select label="Hall" value={formData.hallId} onChange={e => setFormData({ ...formData, hallId: e.target.value })}>
            {availableHalls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            <Select label="Time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}>
              {times.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Base Price ($)" type="number" step="0.01" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })} />
            <Input label="Premium Price ($)" type="number" step="0.01" value={formData.premiumPrice} onChange={e => setFormData({ ...formData, premiumPrice: parseFloat(e.target.value) || 0 })} />
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

