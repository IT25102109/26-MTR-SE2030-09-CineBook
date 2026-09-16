import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, Calendar, Clock, Film, MapPin, Tag, CheckCircle, XCircle, Sparkles, MessageSquare } from 'lucide-react';
import { getShowtimes, getMovies, getBranches, saveShowtime, deleteShowtime, getPromotions, savePromotion, deletePromotion, getAllReviewsForModeration, updateReviewStatus } from '@/data/store';
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
  const { toast } = useToast();
  const [tick, setTick] = useState(0);

  const showtimes = useMemo(() => getShowtimes(), [tick]);
  const movies = useMemo(() => getMovies(), []);
  const branches = useMemo(() => getBranches(), []);
  const promotions = useMemo(() => getPromotions(), [tick]);
  const reviews = useMemo(() => getAllReviewsForModeration(), [tick]);

  const [search, setSearch] = useState('');
  const [movieFilter, setMovieFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Showtime | null>(null);

  const [formData, setFormData] = useState({
    movieId: movies[0]?.id || '',
    branchId: branches[0]?.id || '',
    hallId: branches[0]?.halls[0]?.id || '',
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
          <h1 className="text-3xl font-display font-bold mb-2">Manage Showtimes</h1>
          <p className="text-text-secondary">Schedule and manage movie showtimes, dynamic pricing, and promo campaigns</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setReviewsModalOpen(true)} className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" /> Moderation ({reviews.length})
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
          <Select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
            <option value="all">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
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
            <Button onClick={handleSave}>Add Showtime</Button>
          </>
        }
      >
        <div className="space-y-4">
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
            onChange={e => setFormData({ ...formData, branchId: e.target.value, hallId: branches.find(b => b.id === e.target.value)?.halls[0]?.id || '' })}
          >
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
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
          <p className="text-xs text-text-secondary">Approve or reject community reviews before or after publication.</p>
          {reviews.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No reviews submitted yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {reviews.map(r => {
                const movie = movies.find(m => m.id === r.movieId);
                return (
                  <div key={r.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{r.userName}</span>
                        <Badge variant="default">{movie?.title || 'Movie'}</Badge>
                        <Badge variant={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'amber'}>
                          {r.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary">{r.comment}</p>
                      <span className="text-xs text-text-muted mt-1 block">Rating: {r.rating}/5 • Date: {r.createdAt}</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {r.status !== 'approved' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            updateReviewStatus(r.id, 'approved');
                            setTick(t => t + 1);
                            toast('success', 'Review approved');
                          }}
                          className="text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {r.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            updateReviewStatus(r.id, 'rejected');
                            setTick(t => t + 1);
                            toast('error', 'Review rejected');
                          }}
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

