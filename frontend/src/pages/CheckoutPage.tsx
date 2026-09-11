import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { store, uid } from '@/data/store';
import type { Showtime, Movie, CinemaHall, CinemaBranch, Booking } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function CheckoutPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [hall, setHall] = useState<CinemaHall | null>(null);
  const [branch, setBranch] = useState<CinemaBranch | null>(null);
  const [processing, setProcessing] = useState(false);

  const seats = useMemo(() => {
    const raw = searchParams.get('seats') ?? '';
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!showtimeId) return;
    const st = store.getShowtimes().find((s) => s.id === showtimeId) ?? null;
    setShowtime(st);
    if (st) {
      setMovie(store.getMovies().find((m) => m.id === st.movieId) ?? null);
      setHall(store.getHalls().find((h) => h.id === st.hallId) ?? null);
      setBranch(store.getBranches().find((b) => b.id === st.branchId) ?? null);
    }
  }, [showtimeId]);

  const subtotal = useMemo(() => {
    if (!showtime || !hall) return 0;
    return seats.reduce((sum, seat) => {
      const rowIdx = ROW_LABELS.indexOf(seat.charAt(0));
      const price = rowIdx < hall.premiumRows ? showtime.premiumPrice : showtime.price;
      return sum + price;
    }, 0);
  }, [seats, showtime, hall]);

  const fees = subtotal * 0.12;
  const total = subtotal + fees;

  const validate = () => {
    const e: Record<string, string> = {};
    if (card.number.replace(/\s/g, '').length < 15) e.number = 'Enter a valid card number';
    if (!card.name.trim()) e.name = 'Name is required';
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = 'MM/YY format';
    if (card.cvc.length < 3) e.cvc = '3 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (!validate() || !showtime || !hall || !branch || !movie) return;
    setProcessing(true);
    setTimeout(() => {
      const booking: Booking = {
        id: uid('bk'),
        userId: user.id,
        movieId: movie.id,
        showtimeId: showtime.id,
        branchId: branch.id,
        hallId: hall.id,
        seats,
        date: showtime.date,
        time: showtime.time,
        subtotal,
        fees,
        total,
        status: 'confirmed',
        refundStatus: 'none',
        bookedAt: new Date().toISOString(),
        paymentMethod: `Card •••• ${card.number.slice(-4)}`,
      };
      const bookings = store.getBookings();
      bookings.push(booking);
      store.setBookings(bookings);

      // Mark seats as booked in showtime
      const allShowtimes = store.getShowtimes();
      const idx = allShowtimes.findIndex((s) => s.id === showtime.id);
      if (idx >= 0) {
        allShowtimes[idx] = { ...allShowtimes[idx], bookedSeats: [...allShowtimes[idx].bookedSeats, ...seats] };
        store.setShowtimes(allShowtimes);
      }

      setProcessing(false);
      navigate(`/ticket/${booking.id}`);
    }, 1800);
  };

  if (!showtime || !movie || !hall || !branch) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-ink-400 mb-4">Showtime not found.</p>
        <Link to="/movies"><Button>Back to Movies</Button></Link>
      </div>
    );
  }

  if (seats.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-ink-400 mb-4">No seats selected.</p>
        <Link to={`/booking/${showtimeId}`}><Button>Select Seats</Button></Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ink-300 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment form */}
        <div>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Payment Details</h3>
            </div>
            <div className="space-y-4">
              <Input
                label="Card Number"
                placeholder="4242 4242 4242 4242"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value })}
                error={errors.number}
              />
              <Input
                label="Cardholder Name"
                placeholder="John Doe"
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                error={errors.name}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  error={errors.expiry}
                />
                <Input
                  label="CVC"
                  placeholder="123"
                  maxLength={4}
                  value={card.cvc}
                  onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                  error={errors.cvc}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5 text-xs text-ink-400">
              <Lock className="w-3.5 h-3.5" /> This is a mock payment. No real charge will be made.
            </div>
          </Card>
        </div>

        {/* Order summary */}
        <div>
          <Card className="p-6">
            <h3 className="font-semibold mb-5">Order Summary</h3>
            <div className="space-y-3 mb-4">
              <div className="flex gap-3">
                <img src={movie.posterUrl} alt={movie.title} className="w-16 h-24 rounded-lg object-cover" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{movie.title}</h4>
                  <p className="text-xs text-ink-400 mt-1">{branch.name}</p>
                  <p className="text-xs text-ink-400">{hall.name}</p>
                  <p className="text-xs text-ink-400">{new Date(showtime.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {showtime.time}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/5 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink-300">
                <span>Seats ({seats.length})</span>
                <span>{seats.join(', ')}</span>
              </div>
              <div className="flex justify-between text-ink-300">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-300">
                <span>Booking fees</span>
                <span>${fees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/5">
                <span>Total</span>
                <span className="text-accent">${total.toFixed(2)}</span>
              </div>
            </div>
            <Button fullWidth size="lg" className="mt-6" onClick={handlePay} disabled={processing}>
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Pay ${total.toFixed(2)}</span>
              )}
            </Button>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-ink-400">
              <CheckCircle className="w-3.5 h-3.5 text-success" /> Secure checkout
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
