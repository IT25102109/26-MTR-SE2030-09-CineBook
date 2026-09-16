import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Ticket,
  Film,
  X,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  Search,
  ShieldCheck,
  ArrowRight,
  Info,
  Share2,
  CalendarPlus,
  Copy,
  Check,
  FileCheck,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  getUserBookings,
  cancelBookingWithRefund,
  rescheduleBooking,
  getShowtimesByMovie,
  getShowtime,
  getHall,
  saveNotification,
  getUsers,
  getBookings,
  saveBooking
} from '@/data/store';
import { getGoogleCalendarUrl, downloadIcsFile } from './ETicketPage';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { Booking, Showtime } from '@/types';

type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled' | 'admin-refunds';

interface RefundCalculation {
  tier: 'full' | 'partial' | 'none';
  percentage: number;
  refundAmount: number;
  cancellationFee: number;
  hoursRemaining: number;
  label: string;
}

export function MyBookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'cinemaManager';

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [selectedNewShowtime, setSelectedNewShowtime] = useState<Showtime | null>(null);
  const [shareTarget, setShareTarget] = useState<Booking | null>(null);
  const [refundReviewTarget, setRefundReviewTarget] = useState<Booking | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [calendarMenuTarget, setCalendarMenuTarget] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const allBookings = useMemo(() => {
    if (!user) return [];
    if (isAdminOrManager && activeTab === 'admin-refunds') {
      return getBookings().filter(b => b.status === 'cancelled').sort(
        (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      );
    }
    return getUserBookings(user.id).sort(
      (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    );
  }, [user, tick, activeTab, isAdminOrManager]);

  // Calculate Tiered Refund based on hours before showtime
  const calculateRefund = (booking: Booking): RefundCalculation => {
    try {
      const showtimeDateStr = `${booking.date}T${booking.time}:00`;
      const showtimeTime = new Date(showtimeDateStr).getTime();
      const now = Date.now();
      const diffHours = (showtimeTime - now) / (1000 * 60 * 60);

      if (diffHours > 24) {
        return {
          tier: 'full',
          percentage: 100,
          refundAmount: booking.totalAmount,
          cancellationFee: 0,
          hoursRemaining: Math.max(0, diffHours),
          label: '100% Full Refund (>24h prior)',
        };
      } else if (diffHours >= 6) {
        const fee = booking.totalAmount * 0.5;
        return {
          tier: 'partial',
          percentage: 50,
          refundAmount: booking.totalAmount * 0.5,
          cancellationFee: fee,
          hoursRemaining: Math.max(0, diffHours),
          label: '50% Partial Refund (6h-24h prior)',
        };
      } else {
        return {
          tier: 'none',
          percentage: 0,
          refundAmount: 0,
          cancellationFee: booking.totalAmount,
          hoursRemaining: Math.max(0, diffHours),
          label: 'Non-Refundable (<6h prior)',
        };
      }
    } catch {
      return {
        tier: 'full',
        percentage: 100,
        refundAmount: booking.totalAmount,
        cancellationFee: 0,
        hoursRemaining: 48,
        label: '100% Full Refund',
      };
    }
  };

  // Alternate showtimes for rescheduling
  const availableAlternateShowtimes = useMemo(() => {
    if (!rescheduleTarget) return [];
    const alternates = getShowtimesByMovie(rescheduleTarget.movieId).filter(
      s =>
        s.id !== rescheduleTarget.showtimeId &&
        s.branchId === rescheduleTarget.branchId &&
        new Date(`${s.date}T${s.time}:00`).getTime() > Date.now()
    );
    return alternates.sort(
      (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );
  }, [rescheduleTarget]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Ticket className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-display mb-4">Sign in to view your bookings</h1>
        <Link to="/"><Button>Go Home</Button></Link>
      </div>
    );
  }

  const todayStr = new Date().toDateString();

  // Filter bookings
  const filteredBookings = allBookings.filter(b => {
    const isPast = new Date(b.date) < new Date(todayStr);
    const isCancelled = b.status === 'cancelled';

    if (activeTab === 'upcoming' && (isCancelled || isPast)) return false;
    if (activeTab === 'completed' && (isCancelled || !isPast)) return false;
    if (activeTab === 'cancelled' && !isCancelled) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = b.movieTitle.toLowerCase().includes(q);
      const matchId = b.id.toLowerCase().includes(q);
      const matchBranch = b.branchName.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchBranch) return false;
    }

    return true;
  });

  const confirmCancel = () => {
    if (!cancelTarget) return;
    const calc = calculateRefund(cancelTarget);

    cancelBookingWithRefund(cancelTarget.id, calc.refundAmount);
    setCancelTarget(null);
    setTick(t => t + 1);

    if (calc.refundAmount > 0) {
      toast('success', `Booking cancelled. A refund of $${calc.refundAmount.toFixed(2)} (${calc.percentage}%) was approved.`);
    } else {
      toast('info', 'Booking cancelled. As per cinema policy, cancellations within 6h are non-refundable.');
    }

    addNotification({
      type: 'cancellation_refund',
      title: 'Booking Cancelled',
      message: `Your booking for ${cancelTarget.movieTitle} has been cancelled. Seats ${cancelTarget.seats.join(', ')} were released. Refund: $${calc.refundAmount.toFixed(2)}.`,
    });

    const allUsers = getUsers();
    const managers = allUsers.filter(u => u.role === 'cinemaManager' && u.id !== user?.id);
    managers.forEach(m => {
      saveNotification({
        id: `n${Date.now()}_${m.id}`,
        type: 'cancellation_refund',
        title: 'Booking Cancelled & Seats Released',
        message: `Booking #${cancelTarget.id} for ${cancelTarget.movieTitle} cancelled. Seats ${cancelTarget.seats.join(', ')} released back to inventory. Refund: $${calc.refundAmount.toFixed(2)}.`,
        userId: m.id,
        read: false,
        createdAt: new Date().toISOString(),
        status: 'sent',
      });
    });
  };

  const confirmReschedule = () => {
    if (!rescheduleTarget || !selectedNewShowtime) return;

    const hall = getHall(selectedNewShowtime.branchId, selectedNewShowtime.hallId);
    const hallName = hall ? hall.name : selectedNewShowtime.hallId;

    rescheduleBooking(
      rescheduleTarget.id,
      selectedNewShowtime.id,
      selectedNewShowtime.date,
      selectedNewShowtime.time,
      hallName
    );

    const oldDate = rescheduleTarget.date;
    const oldTime = rescheduleTarget.time;
    setRescheduleTarget(null);
    setSelectedNewShowtime(null);
    setTick(t => t + 1);

    toast('success', `Showtime rescheduled to ${selectedNewShowtime.date} at ${selectedNewShowtime.time}!`);

    addNotification({
      type: 'booking_confirmation',
      title: 'Showtime Rescheduled',
      message: `Your tickets for ${rescheduleTarget.movieTitle} have been rescheduled from ${oldDate} ${oldTime} to ${selectedNewShowtime.date} ${selectedNewShowtime.time}.`,
      link: `/ticket/${rescheduleTarget.id}`,
    });
  };

  const renderBookingCard = (booking: Booking) => {
    const isPast = new Date(booking.date) < new Date(todayStr);
    const isCancelled = booking.status === 'cancelled';
    const refundCalc = calculateRefund(booking);

    return (
      <Card key={booking.id} hover className="overflow-hidden animate-fade-in-up border border-white/5">
        <div className="flex flex-col sm:flex-row">
          <div className="flex-shrink-0">
            <img
              src={booking.moviePoster}
              alt={booking.movieTitle}
              className="w-full sm:w-32 h-44 sm:h-full object-cover"
            />
          </div>
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-display font-semibold text-lg">{booking.movieTitle}</h3>
                    {booking.rescheduledFrom && (
                      <span className="text-[11px] font-mono bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded border border-accent-primary/20">
                        Rescheduled
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted">
                    {booking.branchName} • {booking.hallName}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {isCancelled ? (
                    <Badge variant="red">Cancelled</Badge>
                  ) : isPast ? (
                    <Badge variant="default">Completed</Badge>
                  ) : (
                    <Badge variant="green">Upcoming</Badge>
                  )}

                  {isCancelled && booking.refundAmount !== undefined && (
                    <Badge variant={booking.refundAmount > 0 ? 'blue' : 'amber'} className="text-[11px]">
                      {booking.refundAmount > 0
                        ? `Refunded $${booking.refundAmount.toFixed(2)}`
                        : 'No Refund (<6h)'}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-text-secondary mb-3 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  {new Date(booking.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-text-muted" />
                  {booking.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-text-muted" />
                  Seats: {booking.seats.sort().join(', ')}
                </span>
              </div>

              {booking.rescheduledFrom && (
                <p className="text-xs text-text-muted mb-3 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-accent-primary" />
                  Originally booked for: <span className="font-mono text-text-secondary">{booking.rescheduledFrom}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5 flex-wrap gap-3">
              <div>
                <span className="text-xs text-text-muted">
                  {booking.seats.length} {booking.seats.length === 1 ? 'seat' : 'seats'}
                </span>
                <span className="ml-2 font-display font-bold text-accent-primary">
                  ${booking.totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {!isCancelled && !isPast && (
                  <>
                    <Link to={`/ticket/${booking.id}`}>
                      <Button size="sm" variant="outline">View Ticket</Button>
                    </Link>

                    {/* Calendar Dropdown */}
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCalendarMenuTarget(calendarMenuTarget === booking.id ? null : booking.id)}
                        className="text-xs hover:text-accent-primary"
                        title="Add to Calendar"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" /> Calendar
                      </Button>
                      {calendarMenuTarget === booking.id && (
                        <div className="absolute right-0 bottom-full mb-1.5 w-48 bg-cinema-card hairline rounded-xl shadow-2xl p-1 z-30 space-y-1">
                          <a
                            href={getGoogleCalendarUrl(booking)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setCalendarMenuTarget(null)}
                            className="block px-3 py-1.5 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg"
                          >
                            Google Calendar
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              downloadIcsFile(booking);
                              setCalendarMenuTarget(null);
                              toast('success', 'iCalendar (.ics) file downloaded');
                            }}
                            className="block w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded-lg"
                          >
                            Download .ics (Apple / Outlook)
                          </button>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShareTarget(booking);
                        setCopiedLink(false);
                      }}
                      className="text-xs hover:text-accent-primary"
                      title="Share Digital Guest Pass"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setRescheduleTarget(booking);
                        setSelectedNewShowtime(null);
                      }}
                      className="text-xs hover:text-accent-primary"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setCancelTarget(booking)}
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </Button>
                  </>
                )}

                {activeTab === 'admin-refunds' && isCancelled && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRefundReviewTarget(booking);
                      setAdminRefundNote('');
                    }}
                    className="text-xs text-accent-primary border-accent-primary/40 hover:bg-accent-primary/10 flex items-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" /> Review Refund Override
                  </Button>
                )}

                {activeTab !== 'admin-refunds' && isCancelled && (
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Seats returned to inventory</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">My Bookings</h1>
          <p className="text-text-secondary text-sm">
            Manage your movie tickets, cancellation refunds, and showtime rescheduling
          </p>
        </div>

        {/* Tiered Policy Badge */}
        <div className="p-3 bg-cinema-card hairline rounded-xl flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-text-primary block">Instant Tiered Refund Policy</span>
            <span className="text-text-muted">&gt;24h: 100% | 6–24h: 50% | &lt;6h: 0%</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex gap-1.5 p-1 bg-cinema-card hairline rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'All Bookings' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled & Refunded' },
            ...(isAdminOrManager ? [{ id: 'admin-refunds', label: 'Admin Refund Review 🛡️' }] : []),
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-accent-primary text-black font-semibold shadow'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search movie or booking ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Ticket className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No bookings found</h3>
          <p className="text-sm text-text-muted mb-6">
            {searchQuery ? 'No results matched your search criteria.' : 'Browse movies and book your tickets!'}
          </p>
          <Link to="/movies"><Button>Browse Movies</Button></Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(renderBookingCard)}
        </div>
      )}

      {/* Cancellation & Tiered Refund Modal */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Confirm Booking Cancellation"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>Keep Booking</Button>
            <Button variant="destructive" onClick={confirmCancel}>
              {cancelTarget && calculateRefund(cancelTarget).refundAmount > 0
                ? `Confirm Cancellation & Refund ($${calculateRefund(cancelTarget).refundAmount.toFixed(2)})`
                : 'Confirm Cancellation (No Refund)'}
            </Button>
          </>
        }
      >
        {cancelTarget && (() => {
          const calc = calculateRefund(cancelTarget);
          return (
            <div className="space-y-5">
              <div className="flex gap-3 items-start p-3.5 bg-cinema-base hairline rounded-xl">
                <img
                  src={cancelTarget.moviePoster}
                  alt={cancelTarget.movieTitle}
                  className="w-14 h-20 rounded-lg object-cover"
                />
                <div className="text-xs space-y-1">
                  <h4 className="font-semibold text-sm text-text-primary">{cancelTarget.movieTitle}</h4>
                  <p className="text-text-muted">{cancelTarget.branchName} • {cancelTarget.hallName}</p>
                  <p className="text-text-secondary">
                    {cancelTarget.date} at {cancelTarget.time} • {cancelTarget.seats.join(', ')} ({cancelTarget.seats.length} seats)
                  </p>
                  <p className="text-accent-primary font-semibold">Total Paid: ${cancelTarget.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {/* Tiered Policy Visual Matrix */}
              <div>
                <h5 className="text-xs font-semibold text-text-primary mb-2 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-accent-primary" /> Cinema Refund Policy Tiers:
                </h5>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div
                    className={`p-2.5 rounded-lg border ${
                      calc.tier === 'full'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                        : 'border-white/10 bg-white/[0.02] text-text-muted'
                    }`}
                  >
                    <p className="font-semibold">&gt;24h Before</p>
                    <p className="text-[11px] mt-0.5">100% Refund</p>
                    {calc.tier === 'full' && <span className="text-[10px] text-emerald-400 block mt-1 font-mono">ACTIVE TIER</span>}
                  </div>

                  <div
                    className={`p-2.5 rounded-lg border ${
                      calc.tier === 'partial'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-white/10 bg-white/[0.02] text-text-muted'
                    }`}
                  >
                    <p className="font-semibold">6h - 24h Before</p>
                    <p className="text-[11px] mt-0.5">50% Refund</p>
                    {calc.tier === 'partial' && <span className="text-[10px] text-amber-400 block mt-1 font-mono">ACTIVE TIER</span>}
                  </div>

                  <div
                    className={`p-2.5 rounded-lg border ${
                      calc.tier === 'none'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-300 font-bold'
                        : 'border-white/10 bg-white/[0.02] text-text-muted'
                    }`}
                  >
                    <p className="font-semibold">&lt;6h Before</p>
                    <p className="text-[11px] mt-0.5">Non-Refundable</p>
                    {calc.tier === 'none' && <span className="text-[10px] text-rose-400 block mt-1 font-mono">ACTIVE TIER</span>}
                  </div>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="p-3.5 bg-cinema-base rounded-xl hairline text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-muted">Hours Until Showtime:</span>
                  <span className="font-mono text-text-primary">{calc.hoursRemaining.toFixed(1)} hours remaining</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Eligible Tier:</span>
                  <span className="font-semibold text-text-primary">{calc.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Original Payment:</span>
                  <span>${cancelTarget.totalAmount.toFixed(2)}</span>
                </div>
                {calc.cancellationFee > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Cancellation Fee:</span>
                    <span>-${calc.cancellationFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-white/5 font-semibold text-sm">
                  <span className="text-text-primary">Net Refund Amount:</span>
                  <span className="text-emerald-400 font-mono">${calc.refundAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-accent-primary/10 border border-accent-primary/20 text-xs text-text-secondary flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                <p>
                  Upon cancellation, seats <span className="font-mono font-bold text-accent-primary">{cancelTarget.seats.join(', ')}</span> will immediately be released back into the hall inventory for other guests.
                </p>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Reschedule Showtime Modal */}
      <Modal
        open={!!rescheduleTarget}
        onClose={() => {
          setRescheduleTarget(null);
          setSelectedNewShowtime(null);
        }}
        title="Reschedule Showtime"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setRescheduleTarget(null);
                setSelectedNewShowtime(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReschedule}
              disabled={!selectedNewShowtime}
            >
              Confirm Reschedule
            </Button>
          </>
        }
      >
        {rescheduleTarget && (
          <div className="space-y-5">
            <div className="p-3 bg-cinema-base hairline rounded-xl text-xs space-y-1">
              <span className="text-text-muted block">Current Showtime:</span>
              <p className="font-semibold text-text-primary">
                {rescheduleTarget.movieTitle} • {rescheduleTarget.branchName}
              </p>
              <p className="text-accent-primary font-mono">
                {rescheduleTarget.date} at {rescheduleTarget.time} ({rescheduleTarget.hallName})
              </p>
              <p className="text-text-secondary">Seats: {rescheduleTarget.seats.join(', ')}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-text-primary mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent-primary" /> Select an Alternate Showtime Slot:
              </h4>

              {availableAlternateShowtimes.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-text-muted">
                  No alternate showtimes currently available for this movie at {rescheduleTarget.branchName}.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {availableAlternateShowtimes.map(st => {
                    const hall = getHall(st.branchId, st.hallId);
                    const isSelected = selectedNewShowtime?.id === st.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedNewShowtime(st)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-accent-primary bg-accent-primary/10 shadow-sm'
                            : 'border-white/10 hover:border-white/20 bg-cinema-card'
                        }`}
                      >
                        <div className="text-xs space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-primary">
                              {new Date(st.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="font-mono text-accent-primary font-bold">{st.time}</span>
                          </div>
                          <p className="text-text-muted">{hall ? hall.name : st.hallId}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-[11px] font-mono">
                            ${st.basePrice}
                          </Badge>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-accent-primary" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedNewShowtime && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Booking will be moved to {selectedNewShowtime.date} at {selectedNewShowtime.time} without any additional fees.
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Admin Refund Review & Override Modal (Phase 3 - Function 5: IT25101655) */}
      <Modal
        open={!!refundReviewTarget}
        onClose={() => setRefundReviewTarget(null)}
        title="Admin Cancellation & Refund Review"
        size="md"
        footer={
          <Button variant="ghost" onClick={() => setRefundReviewTarget(null)}>Cancel</Button>
        }
      >
        {refundReviewTarget && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-cinema-base hairline rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Booking Reference:</span>
                <span className="font-mono font-bold text-text-primary">{refundReviewTarget.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Customer User ID:</span>
                <span className="text-text-primary font-medium">{refundReviewTarget.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Movie & Screening:</span>
                <span className="text-accent-primary">{refundReviewTarget.movieTitle} ({refundReviewTarget.branchName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Original Amount Paid:</span>
                <span className="font-bold text-text-primary">${refundReviewTarget.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Automated Refund Issued:</span>
                <span className="font-bold text-amber-400">${(refundReviewTarget.refundAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Admin Review Notes / Justification:
              </label>
              <textarea
                rows={2}
                value={adminRefundNote}
                onChange={e => setAdminRefundNote(e.target.value)}
                placeholder="e.g. Customer reported medical emergency or cinema technical issue. Authorizing exceptional refund."
                className="w-full bg-cinema-base border border-white/10 rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  const updated: Booking = {
                    ...refundReviewTarget,
                    refundAmount: refundReviewTarget.totalAmount,
                    refundStatus: 'approved',
                  };
                  saveBooking(updated);
                  saveNotification({
                    id: `n${Date.now()}_refund`,
                    userId: refundReviewTarget.userId,
                    title: 'Refund Override Approved',
                    message: `Your cancellation for ${refundReviewTarget.movieTitle} was granted an exceptional 100% refund of $${refundReviewTarget.totalAmount.toFixed(2)} by cinema administration.`,
                    type: 'refund_processed',
                    read: false,
                    createdAt: new Date().toISOString(),
                    status: 'sent',
                  });
                  setRefundReviewTarget(null);
                  setTick(t => t + 1);
                  toast('success', `Exceptional 100% refund ($${refundReviewTarget.totalAmount.toFixed(2)}) approved for ${refundReviewTarget.id}!`);
                }}
                className="text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
              >
                Approve 100% Full Refund
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const updated: Booking = {
                    ...refundReviewTarget,
                    refundStatus: 'approved',
                  };
                  saveBooking(updated);
                  saveNotification({
                    id: `n${Date.now()}_credit`,
                    userId: refundReviewTarget.userId,
                    title: 'Cinema Credit Voucher Issued',
                    message: `A full promotional credit voucher for $${refundReviewTarget.totalAmount.toFixed(2)} has been issued for your cancelled screening of ${refundReviewTarget.movieTitle}.`,
                    type: 'refund_processed',
                    read: false,
                    createdAt: new Date().toISOString(),
                    status: 'sent',
                  });
                  setRefundReviewTarget(null);
                  setTick(t => t + 1);
                  toast('success', `Cinema credit voucher for $${refundReviewTarget.totalAmount.toFixed(2)} dispatched to user!`);
                }}
                className="text-xs border-accent-primary/40 text-accent-primary hover:bg-accent-primary/10"
              >
                Issue Credit Voucher
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Share Digital Guest Pass Modal */}
      <Modal
        open={!!shareTarget}
        onClose={() => { setShareTarget(null); setCopiedLink(false); }}
        title="Share Digital Guest Pass"
        size="md"
        footer={
          <Button variant="ghost" onClick={() => setShareTarget(null)}>Close</Button>
        }
      >
        {shareTarget && (
          <div className="space-y-4 p-1">
            <p className="text-xs text-text-secondary">
              Share an entrance pass and ticket details with a friend so they can join you at the cinema.
            </p>

            <div className="p-3.5 rounded-xl bg-cinema-base border border-white/10 space-y-1 text-xs">
              <p className="font-semibold text-text-primary">{shareTarget.movieTitle}</p>
              <p className="text-text-secondary">{shareTarget.branchName} • {shareTarget.hallName}</p>
              <p className="text-accent-primary font-mono">{shareTarget.date} at {shareTarget.time} • Seats: {shareTarget.seats.join(', ')}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Direct Ticket Link</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={`${window.location.origin}/ticket/${shareTarget.id}?guest=true`}
                  className="flex-1 bg-cinema-base border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-text-secondary select-all"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/ticket/${shareTarget.id}?guest=true`);
                    setCopiedLink(true);
                    toast('success', 'Pass link copied to clipboard!');
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🍿 Hey! Here is our CineBook ticket for ${shareTarget.movieTitle} at ${shareTarget.branchName} on ${shareTarget.date} at ${shareTarget.time}. Seats: ${shareTarget.seats.join(', ')}.\nPass Link: ${window.location.origin}/ticket/${shareTarget.id}?guest=true`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md"
            >
              <Share2 className="w-4 h-4" /> Share via WhatsApp
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}
