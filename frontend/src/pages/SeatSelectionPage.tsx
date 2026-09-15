import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Armchair, Info } from 'lucide-react';
import { getShowtime, getMovie, getBranch, getHall, updateShowtimeSeats } from '@/data/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const rowLetters = 'ABCDEFGHIJ';

export function SeatSelectionPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const showtime = useMemo(() => showtimeId ? getShowtime(showtimeId) : undefined, [showtimeId]);
  const movie = useMemo(() => showtime ? getMovie(showtime.movieId) : undefined, [showtime]);
  const branch = useMemo(() => showtime ? getBranch(showtime.branchId) : undefined, [showtime]);
  const hall = useMemo(() => showtime ? getHall(showtime.branchId, showtime.hallId) : undefined, [showtime]);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  if (!showtime || !movie || !branch || !hall) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">Showtime not found</h1>
        <Link to="/movies"><Button>Browse Movies</Button></Link>
      </div>
    );
  }

  const toggleSeat = (seatId: string) => {
    if (showtime.bookedSeats.includes(seatId)) return;
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  const isPremiumRow = (rowIdx: number) => rowIdx >= hall.rows - hall.premiumRows;
  const getSeatPrice = (seatId: string) => {
    const row = seatId.match(/^([A-J])/)?.[1];
    if (!row) return showtime.basePrice;
    const rowIdx = rowLetters.indexOf(row);
    return isPremiumRow(rowIdx) ? showtime.premiumPrice : showtime.basePrice;
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

  const handleProceed = () => {
    if (!user) {
      toast('info', 'Please sign in to continue booking');
      return;
    }
    if (selectedSeats.length === 0) {
      toast('error', 'Select at least one seat');
      return;
    }
    updateShowtimeSeats(showtime.id, selectedSeats);
    navigate('/checkout', {
      state: {
        showtimeId: showtime.id,
        movieId: movie.id,
        seats: selectedSeats,
        totalAmount: totalPrice,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to={`/movies/${movie.id}`} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent-primary transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to {movie.title}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">{movie.title}</h1>
        <div className="flex items-center gap-3 text-sm text-text-secondary flex-wrap">
          <span>{branch.name}</span>
          <span className="text-text-muted">•</span>
          <span>{hall.name}</span>
          <span className="text-text-muted">•</span>
          <span>{new Date(showtime.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          <span className="text-text-muted">•</span>
          <span>{showtime.time}</span>
        </div>
      </div>

      {/* Screen indicator */}
      <div className="mb-8 flex justify-center">
        <div className="w-full max-w-2xl">
          <div className="relative h-2 bg-gradient-to-r from-transparent via-accent-primary/40 to-transparent rounded-full" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
          <p className="text-center text-xs text-text-muted mt-2 tracking-widest uppercase">Screen</p>
        </div>
      </div>

      {/* Seat Map */}
      <div className="overflow-x-auto pb-4 mb-8">
        <div className="min-w-fit mx-auto">
          {Array.from({ length: hall.rows }, (_, rowIdx) => {
            const rowLetter = rowLetters[rowIdx];
            const premium = isPremiumRow(rowIdx);
            return (
              <div key={rowIdx} className="flex items-center justify-center gap-2 mb-2">
                <span className="w-6 text-center text-xs text-text-muted font-medium">{rowLetter}</span>
                <div className="flex gap-1.5 sm:gap-2">
                  {Array.from({ length: hall.seatsPerRow }, (_, seatIdx) => {
                    const seatNum = seatIdx + 1;
                    const seatId = `${rowLetter}${seatNum}`;
                    const booked = showtime.bookedSeats.includes(seatId);
                    const selected = selectedSeats.includes(seatId);
                    const isAisleAfter = seatIdx === Math.floor(hall.seatsPerRow / 2) - 1;

                    return (
                      <div key={seatIdx} className="flex items-center">
                        <button
                          onClick={() => toggleSeat(seatId)}
                          disabled={booked}
                          className={`
                            relative w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition-all
                            ${booked
                              ? 'bg-cinema-elevated text-text-muted cursor-not-allowed opacity-50'
                              : selected
                              ? 'bg-accent-primary text-black scale-110 shadow-glow-amber'
                              : premium
                              ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30 hover:bg-accent-primary/25'
                              : 'bg-cinema-elevated text-text-secondary border border-white/10 hover:border-accent-primary/40 hover:text-text-primary'
                            }
                            ${premium && !booked && !selected ? 'animate-pulse-glow' : ''}
                          `}
                          title={`${seatId} — ${booked ? 'Booked' : premium ? `$${showtime.premiumPrice} (Premium)` : `$${showtime.basePrice}`}`}
                        >
                          {booked ? (
                            <span className="text-xs">×</span>
                          ) : (
                            <span className="text-[10px] font-medium">{seatNum}</span>
                          )}
                        </button>
                        {isAisleAfter && <div className="w-3 sm:w-4" />}
                      </div>
                    );
                  })}
                </div>
                <span className="w-6 text-center text-xs text-text-muted font-medium">{rowLetter}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-cinema-elevated border border-white/10" />
          <span className="text-xs text-text-secondary">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-accent-primary/15 border border-accent-primary/30" />
          <span className="text-xs text-text-secondary">Premium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-accent-primary" />
          <span className="text-xs text-text-secondary">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-cinema-elevated opacity-50" />
          <span className="text-xs text-text-secondary">Booked</span>
        </div>
      </div>

      {/* Summary */}
      <Card className="p-5 sticky bottom-4 z-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            {selectedSeats.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Armchair className="w-4 h-4 text-accent-primary" />
                  <span className="text-sm font-medium">{selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'} selected</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {selectedSeats.sort().map(seat => (
                    <Badge key={seat} variant="amber">{seat}</Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-text-muted">
                <Info className="w-4 h-4" />
                <span className="text-sm">Select seats from the map above</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-text-muted">Total</p>
              <p className="text-2xl font-display font-bold text-accent-primary">${totalPrice.toFixed(2)}</p>
            </div>
            <Button size="lg" onClick={handleProceed} disabled={selectedSeats.length === 0}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
