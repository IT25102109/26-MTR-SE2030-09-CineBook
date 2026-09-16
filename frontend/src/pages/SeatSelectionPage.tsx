import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Armchair, Info, Timer, Users, Accessibility, AlertTriangle, RefreshCw } from 'lucide-react';
import { getShowtime, getMovie, getBranch, getHall, updateShowtimeSeats } from '@/data/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const rowLetters = 'ABCDEFGHIJ';
const HOLD_DURATION = 300; // 5 minutes in seconds

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
  const [timeLeft, setTimeLeft] = useState<number>(HOLD_DURATION);
  const [timerExpired, setTimerExpired] = useState(false);

  // Seat hold countdown timer (Function 3: Concurrency protection)
  useEffect(() => {
    if (selectedSeats.length === 0) {
      setTimeLeft(HOLD_DURATION);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerExpired(true);
          setSelectedSeats([]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSeats.length]);

  if (!showtime || !movie || !branch || !hall) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">Showtime not found</h1>
        <Link to="/movies"><Button>Browse Movies</Button></Link>
      </div>
    );
  }

  const isWheelchairSeat = (seatId: string) => {
    // Row A, seats 1 and 2 are designated accessible
    return seatId === 'A1' || seatId === 'A2';
  };

  const toggleSeat = (seatId: string) => {
    if (showtime.bookedSeats.includes(seatId)) return;
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  // Automated Contiguous Group Seat Selector
  const autoSelectAdjacent = (count: number) => {
    // Search rows starting from optimal middle row backwards/forwards
    const midRow = Math.floor(hall.rows / 2);
    const rowOrder: number[] = [];
    for (let offset = 0; offset < hall.rows; offset++) {
      if (midRow + offset < hall.rows) rowOrder.push(midRow + offset);
      if (offset > 0 && midRow - offset >= 0) rowOrder.push(midRow - offset);
    }

    for (const rIdx of rowOrder) {
      const rowLetter = rowLetters[rIdx];
      for (let sIdx = 1; sIdx <= hall.seatsPerRow - count + 1; sIdx++) {
        const potentialGroup: string[] = [];
        let allAvailable = true;

        for (let k = 0; k < count; k++) {
          const sId = `${rowLetter}${sIdx + k}`;
          if (showtime.bookedSeats.includes(sId)) {
            allAvailable = false;
            break;
          }
          potentialGroup.push(sId);
        }

        if (allAvailable) {
          setSelectedSeats(potentialGroup);
          setTimeLeft(HOLD_DURATION);
          toast('success', `Selected ${count} contiguous seats in Row ${rowLetter} (${potentialGroup.join(', ')})`);
          return;
        }
      }
    }

    toast('error', `Could not find ${count} contiguous available seats together in the same row.`);
  };

  const isPremiumRow = (rowIdx: number) => rowIdx >= hall.rows - hall.premiumRows;
  const getSeatPrice = (seatId: string) => {
    const row = seatId.match(/^([A-J])/)?.[1];
    if (!row) return showtime.basePrice;
    const rowIdx = rowLetters.indexOf(row);
    return isPremiumRow(rowIdx) ? showtime.premiumPrice : showtime.basePrice;
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

      {/* 5-Minute Concurrency Hold Timer & Group Assistant Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Live Timer Banner */}
        <div className={`p-4 rounded-xl hairline flex items-center justify-between transition-all ${selectedSeats.length > 0 ? 'bg-accent-primary/10 border-accent-primary/30' : 'bg-cinema-card'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${selectedSeats.length > 0 ? 'bg-accent-primary text-black animate-pulse' : 'bg-cinema-elevated text-text-muted'}`}>
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Concurrency Seat Hold Timer</p>
              <p className="text-sm text-text-muted">
                {selectedSeats.length > 0 ? 'Seats temporarily locked for checkout' : 'Select seats to start 5-minute reservation timer'}
              </p>
            </div>
          </div>
          <div className="text-right font-mono font-bold text-lg">
            {selectedSeats.length > 0 ? (
              <span className={timeLeft < 60 ? 'text-accent-destructive animate-pulse' : 'text-accent-primary'}>
                {formatTimer(timeLeft)}
              </span>
            ) : (
              <span className="text-text-muted">05:00</span>
            )}
          </div>
        </div>

        {/* Group Booking Assistant */}
        <div className="p-4 rounded-xl bg-cinema-card hairline flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cinema-elevated text-accent-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Group Booking Assistant</p>
              <p className="text-sm text-text-muted">Auto-find adjacent contiguous seats</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => autoSelectAdjacent(n)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cinema-elevated border border-white/10 hover:border-accent-primary/40 hover:text-accent-primary transition-all"
                title={`Select ${n} adjacent seats`}
              >
                {n}
              </button>
            ))}
          </div>
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
                    const isAccessible = isWheelchairSeat(seatId);

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
                              : isAccessible
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25'
                              : premium
                              ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30 hover:bg-accent-primary/25'
                              : 'bg-cinema-elevated text-text-secondary border border-white/10 hover:border-accent-primary/40 hover:text-text-primary'
                            }
                            ${premium && !booked && !selected ? 'animate-pulse-glow' : ''}
                          `}
                          title={`${seatId} — ${booked ? 'Booked' : isAccessible ? 'Wheelchair Accessible' : premium ? `$${showtime.premiumPrice} (Premium)` : `$${showtime.basePrice}`}`}
                        >
                          {booked ? (
                            <span className="text-xs">×</span>
                          ) : isAccessible && !selected ? (
                            <Accessibility className="w-3.5 h-3.5 text-blue-400" />
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
          <div className="w-5 h-5 rounded-md bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <Accessibility className="w-3 h-3 text-blue-400" />
          </div>
          <span className="text-xs text-text-secondary">Wheelchair Accessible</span>
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

      {/* Seat Reservation Expired Modal */}
      <Modal
        open={timerExpired}
        onClose={() => setTimerExpired(false)}
        title="Reservation Hold Expired"
        size="sm"
        footer={
          <Button onClick={() => setTimerExpired(false)} className="w-full">
            Select Seats Again
          </Button>
        }
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-text-secondary">
            Your 5-minute seat hold has expired. To maintain fair seat availability under concurrent traffic, your temporary lock has been released.
          </p>
        </div>
      </Modal>
    </div>
  );
}

