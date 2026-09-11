import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Monitor, Crown } from 'lucide-react';
import { store } from '@/data/store';
import type { Showtime, Movie, CinemaHall, CinemaBranch } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function SeatSelectionPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [hall, setHall] = useState<CinemaHall | null>(null);
  const [branch, setBranch] = useState<CinemaBranch | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

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

  const bookedSet = useMemo(() => new Set(showtime?.bookedSeats ?? []), [showtime]);

  const toggleSeat = (seat: string) => {
    if (bookedSet.has(seat)) return;
    setSelected((prev) => (prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]));
  };

  const isPremium = (rowIdx: number) => hall ? rowIdx < hall.premiumRows : false;

  const pricePerSeat = (rowIdx: number) => (isPremium(rowIdx) ? showtime!.premiumPrice : showtime!.price);

  const subtotal = useMemo(() => {
    if (!showtime || !hall) return 0;
    return selected.reduce((sum, seat) => {
      const rowIdx = ROW_LABELS.indexOf(seat.charAt(0));
      return sum + pricePerSeat(rowIdx);
    }, 0);
  }, [selected, showtime, hall]);

  const fees = useMemo(() => subtotal * 0.12, [subtotal]);
  const total = subtotal + fees;

  if (!showtime || !movie || !hall) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-ink-400 mb-4">Showtime not found.</p>
        <Link to="/movies"><Button>Back to Movies</Button></Link>
      </div>
    );
  }

  const maxSeats = 8;

  return (
    <div className="container-app py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ink-300 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{movie.title}</h1>
          <div className="flex items-center gap-2 text-sm text-ink-400 mt-1">
            <span>{branch?.name}</span>
            <span>•</span>
            <span>{hall.name}</span>
            <span>•</span>
            <span>{new Date(showtime.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {showtime.time}</span>
          </div>
        </div>
        <Badge variant="accent"><Monitor className="w-3 h-3" /> {selected.length}/{maxSeats} seats selected</Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Seat map */}
        <div className="lg:col-span-2">
          <Card className="p-6 overflow-x-auto">
            {/* Screen */}
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-md">
                <div className="h-2 bg-gradient-to-r from-transparent via-accent/60 to-transparent rounded-full mb-2" />
                <p className="text-center text-xs text-ink-400 tracking-widest">SCREEN</p>
              </div>
            </div>

            {/* Seats */}
            <div className="flex flex-col items-center gap-2">
              {Array.from({ length: hall.rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs text-ink-400">{ROW_LABELS[rowIdx]}</span>
                  {Array.from({ length: hall.cols }).map((_, colIdx) => {
                    const seat = `${ROW_LABELS[rowIdx]}${colIdx + 1}`;
                    const isBooked = bookedSet.has(seat);
                    const isSelected = selected.includes(seat);
                    const premium = isPremium(rowIdx);
                    return (
                      <button
                        key={seat}
                        onClick={() => toggleSeat(seat)}
                        disabled={isBooked || (selected.length >= maxSeats && !isSelected)}
                        className={`w-7 h-7 rounded-md text-[10px] font-medium transition-all duration-150 ${
                          isBooked
                            ? 'bg-ink-700 text-ink-500 cursor-not-allowed'
                            : isSelected
                            ? 'bg-accent text-white scale-110 shadow-glow'
                            : premium
                            ? 'bg-gold/20 hover:bg-gold/40 text-gold border border-gold/30'
                            : 'bg-ink-600 hover:bg-ink-500 text-ink-200'
                        }`}
                        title={`${seat} — ${isBooked ? 'Booked' : premium ? 'Premium $' + showtime.premiumPrice.toFixed(0) : '$' + showtime.price.toFixed(0)}`}
                      >
                        {colIdx + 1}
                      </button>
                    );
                  })}
                  <span className="w-5 text-center text-xs text-ink-400">{ROW_LABELS[rowIdx]}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-5 mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-ink-300">
                <div className="w-5 h-5 rounded-md bg-ink-600" /> Available
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-300">
                <div className="w-5 h-5 rounded-md bg-gold/20 border border-gold/30" /> Premium
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-300">
                <div className="w-5 h-5 rounded-md bg-accent" /> Selected
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-300">
                <div className="w-5 h-5 rounded-md bg-ink-700" /> Booked
              </div>
            </div>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="p-6 sticky top-20">
            <h3 className="font-semibold mb-4">Booking Summary</h3>
            {selected.length === 0 ? (
              <p className="text-sm text-ink-400 mb-4">Select seats from the map to continue.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {selected.map((seat) => {
                  const rowIdx = ROW_LABELS.indexOf(seat.charAt(0));
                  const price = pricePerSeat(rowIdx);
                  return (
                    <div key={seat} className="flex justify-between text-sm">
                      <span className="text-ink-300">Seat {seat} {isPremium(rowIdx) && <Crown className="w-3 h-3 inline text-gold" />}</span>
                      <span>${price.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 pt-4 border-t border-white/5 text-sm">
              <div className="flex justify-between text-ink-300">
                <span>Subtotal ({selected.length} seats)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-300">
                <span>Booking fees (12%)</span>
                <span>${fees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/5">
                <span>Total</span>
                <span className="text-accent">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              className="mt-6"
              disabled={selected.length === 0}
              onClick={() => navigate(`/checkout/${showtimeId}?seats=${selected.join(',')}`)}
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
