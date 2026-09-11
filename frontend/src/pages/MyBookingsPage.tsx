import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Ticket, XCircle, RotateCcw, Film, ChevronRight } from 'lucide-react';
import { store } from '@/data/store';
import type { Booking, Movie, CinemaHall, CinemaBranch } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [halls, setHalls] = useState<CinemaHall[]>([]);
  const [branches, setBranches] = useState<CinemaBranch[]>([]);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const refresh = () => {
    setBookings(store.getBookings().filter((b) => b.userId === user.id));
    setMovies(store.getMovies());
    setHalls(store.getHalls());
    setBranches(store.getBranches());
  };

  useEffect(() => { refresh(); }, [user.id]);

  const now = new Date();
  const upcoming = useMemo(() => bookings.filter((b) => new Date(b.date + 'T' + b.time) >= now && b.status === 'confirmed'), [bookings, now]);
  const past = useMemo(() => bookings.filter((b) => new Date(b.date + 'T' + b.time) < now || b.status === 'cancelled'), [bookings, now]);

  const activeList = tab === 'upcoming' ? upcoming : past;

  const getMovie = (id: string) => movies.find((m) => m.id === id);
  const getHall = (id: string) => halls.find((h) => h.id === id);
  const getBranch = (id: string) => branches.find((b) => b.id === id);

  const confirmCancel = () => {
    if (!cancelTarget) return;
    const all = store.getBookings();
    const idx = all.findIndex((b) => b.id === cancelTarget.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], status: 'cancelled', refundStatus: 'refunded' };
      store.setBookings(all);
      // Free up seats
      const showtimes = store.getShowtimes();
      const sIdx = showtimes.findIndex((s) => s.id === cancelTarget.showtimeId);
      if (sIdx >= 0) {
        showtimes[sIdx].bookedSeats = showtimes[sIdx].bookedSeats.filter((s) => !cancelTarget.seats.includes(s));
        store.setShowtimes(showtimes);
      }
    }
    setCancelTarget(null);
    refresh();
  };

  return (
    <div className="container-app py-8">
      <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
      <p className="text-ink-400 mb-6">View and manage your movie tickets.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/5">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              tab === t ? 'text-white border-accent' : 'text-ink-400 border-transparent hover:text-ink-200'
            }`}
          >
            {t === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
          </button>
        ))}
      </div>

      {activeList.length === 0 ? (
        <Card className="p-12 text-center">
          <Film className="w-16 h-16 text-ink-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No {tab} bookings</h3>
          <p className="text-ink-400 mb-4">{tab === 'upcoming' ? 'Book a movie to see it here.' : 'Your past bookings will appear here.'}</p>
          <Link to="/movies"><Button>Browse Movies</Button></Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeList.map((b, i) => {
            const m = getMovie(b.movieId);
            const h = getHall(b.hallId);
            const br = getBranch(b.branchId);
            if (!m) return null;
            const isCancelled = b.status === 'cancelled';
            return (
              <Card key={b.id} className="p-5 animate-fade-in" >
                <div className="flex flex-col sm:flex-row gap-5">
                  <img src={m.posterUrl} alt={m.title} className="w-24 h-36 rounded-lg object-cover shrink-0 mx-auto sm:mx-0" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{m.title}</h3>
                        <p className="text-xs text-ink-400 font-mono">{b.id}</p>
                      </div>
                      {isCancelled ? (
                        <Badge variant="error"><XCircle className="w-3 h-3" /> Cancelled</Badge>
                      ) : b.refundStatus === 'refunded' ? (
                        <Badge variant="warning"><RotateCcw className="w-3 h-3" /> Refunded</Badge>
                      ) : (
                        <Badge variant="success">Confirmed</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-ink-300 mb-3">
                      <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-ink-400" /> {new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-ink-400" /> {b.time}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-ink-400" /> {br?.name}</div>
                      <div className="flex items-center gap-1.5"><Ticket className="w-4 h-4 text-ink-400" /> {b.seats.join(', ')}</div>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="text-sm">
                        <span className="text-ink-400">Total: </span>
                        <span className="font-bold text-accent">${b.total.toFixed(2)}</span>
                        {isCancelled && b.refundStatus === 'refunded' && (
                          <span className="text-success ml-2 text-xs">Refund processed</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!isCancelled && (
                          <>
                            <Link to={`/ticket/${b.id}`}><Button size="sm" variant="outline">View Ticket <ChevronRight className="w-4 h-4" /></Button></Link>
                            {tab === 'upcoming' && (
                              <Button size="sm" variant="danger" onClick={() => setCancelTarget(b)}>
                                <XCircle className="w-4 h-4" /> Cancel
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel modal */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Booking" size="sm">
        {cancelTarget && (
          <div>
            <p className="text-ink-300 mb-2">Are you sure you want to cancel this booking?</p>
            <div className="bg-ink-800 rounded-xl p-4 mb-4 space-y-1 text-sm">
              <div><span className="text-ink-400">Movie:</span> {getMovie(cancelTarget.movieId)?.title}</div>
              <div><span className="text-ink-400">Date:</span> {new Date(cancelTarget.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {cancelTarget.time}</div>
              <div><span className="text-ink-400">Seats:</span> {cancelTarget.seats.join(', ')}</div>
              <div><span className="text-ink-400">Refund amount:</span> <span className="text-success font-semibold">${cancelTarget.total.toFixed(2)}</span></div>
            </div>
            <p className="text-xs text-ink-400 mb-5">A full refund will be processed to your original payment method. This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setCancelTarget(null)}>Keep Booking</Button>
              <Button variant="danger" onClick={confirmCancel}>Yes, Cancel & Refund</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
