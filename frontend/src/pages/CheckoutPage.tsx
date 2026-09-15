import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Lock, CreditCard, Ticket } from 'lucide-react';
import { getShowtime, getMovie, getBranch, getHall, saveBooking, saveNotification, getUsers } from '@/data/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Booking } from '@/types';

interface CheckoutState {
  showtimeId: string;
  movieId: string;
  seats: string[];
  totalAmount: number;
}

export function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const state = location.state as CheckoutState | null;

  const showtime = state ? getShowtime(state.showtimeId) : undefined;
  const movie = state ? getMovie(state.movieId) : undefined;
  const branch = showtime ? getBranch(showtime.branchId) : undefined;
  const hall = showtime ? getHall(showtime.branchId, showtime.hallId) : undefined;

  const [processing, setProcessing] = useState(false);
  const [cardName, setCardName] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  if (!state || !showtime || !movie || !branch || !hall) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">No booking in progress</h1>
        <Link to="/movies"><Button>Browse Movies</Button></Link>
      </div>
    );
  }

  const subtotal = state.totalAmount;
  const bookingFee = state.seats.length * 1.50;
  const tax = (subtotal + bookingFee) * 0.08;
  const total = subtotal + bookingFee + tax;

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handlePay = () => {
    if (!cardName.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      toast('error', 'Please fill in all payment fields');
      return;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      toast('error', 'Please enter a valid card number');
      return;
    }
    if (!user) {
      toast('info', 'Please sign in to complete booking');
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      const booking: Booking = {
        id: `bk${Date.now()}`,
        userId: user.id,
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster,
        branchId: branch.id,
        branchName: branch.name,
        hallName: hall.name,
        showtimeId: showtime.id,
        date: showtime.date,
        time: showtime.time,
        seats: state.seats,
        totalAmount: total,
        status: 'confirmed',
        refundStatus: 'none',
        bookingDate: new Date().toISOString().split('T')[0],
      };

      saveBooking(booking);
      setProcessing(false);
      toast('success', 'Booking confirmed! Your e-ticket is ready.');

      addNotification({
        type: 'booking_confirmation',
        title: 'Booking Confirmed',
        message: `Your booking for ${movie.title} at ${branch.name} has been confirmed. ${state.seats.length} seats: ${state.seats.sort().join(', ')}.`,
        link: `/ticket/${booking.id}`,
      });

      const managers = getUsers().filter(u => u.role === 'cinemaManager');
      managers.forEach(m => {
        if (m.id !== user.id) {
          saveNotification({
            id: `n${Date.now()}_${m.id}`,
            type: 'new_booking',
            title: 'New Booking Alert',
            message: `New booking for ${movie.title} at ${branch.name}, ${hall.name}. ${state.seats.length} seats booked.`,
            userId: m.id,
            read: false,
            createdAt: new Date().toISOString(),
            status: 'sent',
          });
        }
      });

      navigate(`/ticket/${booking.id}`);
    }, 1800);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to={`/booking/${showtime.id}`} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent-primary transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Seat Selection
      </Link>

      <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Payment form */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-5 h-5 text-accent-primary" />
              <h2 className="font-display font-semibold text-lg">Payment Details</h2>
            </div>

            <div className="space-y-4">
              <Input
                label="Name on Card"
                placeholder="John Doe"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
              />
              <Input
                label="Card Number"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                />
                <Input
                  label="CVV"
                  placeholder="123"
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  type="password"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-5 pt-5 border-t border-white/5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-text-muted">This is a mock payment — no real transaction will occur. Use any card details.</p>
            </div>
          </Card>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <Card className="p-6 sticky top-20">
            <div className="flex items-center gap-2 mb-5">
              <Ticket className="w-5 h-5 text-accent-primary" />
              <h2 className="font-display font-semibold text-lg">Order Summary</h2>
            </div>

            <div className="flex gap-4 mb-5">
              <img src={movie.poster} alt={movie.title} className="w-20 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{movie.title}</h3>
                <p className="text-xs text-text-muted mt-0.5">{branch.name}</p>
                <p className="text-xs text-text-muted">{hall.name}</p>
                <p className="text-xs text-text-secondary mt-1">
                  {new Date(showtime.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {showtime.time}
                </p>
              </div>
            </div>

            <div className="flex gap-1.5 flex-wrap mb-5">
              {state.seats.sort().map(seat => (
                <Badge key={seat} variant="amber">{seat}</Badge>
              ))}
            </div>

            <div className="space-y-2.5 text-sm pb-5 border-b border-white/5">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal ({state.seats.length} seats)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Booking Fee</span>
                <span>${bookingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="font-medium">Total</span>
              <span className="text-2xl font-display font-bold text-accent-primary">${total.toFixed(2)}</span>
            </div>

            <Button fullWidth size="lg" onClick={handlePay} disabled={processing}>
              {processing ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay ${total.toFixed(2)}
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
