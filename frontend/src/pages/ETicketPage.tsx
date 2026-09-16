import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, MapPin, Film, Download, Home } from 'lucide-react';
import { getBookings } from '@/data/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function ETicketPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const booking = useMemo(() => getBookings().find(b => b.id === bookingId), [bookingId]);

  const qrPattern = useMemo(() => {
    if (!booking) return [];
    const seed = booking.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const cells: boolean[] = [];
    for (let i = 0; i < 144; i++) {
      cells.push(((seed * (i + 1) * 2654435761) % 2) === 0);
    }
    return cells;
  }, [booking]);

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">Ticket not found</h1>
        <Link to="/movies"><Button>Browse Movies</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-text-secondary">Your e-ticket has been generated. Present this at the cinema entrance.</p>
      </div>

      <div className="relative animate-scale-in">
        {/* Ticket */}
        <div className="bg-cinema-card hairline rounded-2xl overflow-hidden shadow-soft-xl">
          {/* Top section */}
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <img src={booking.moviePoster} alt={booking.movieTitle} className="w-24 sm:w-28 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-bold text-xl sm:text-2xl mb-2 truncate">{booking.movieTitle}</h2>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <MapPin className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span>{booking.branchName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Film className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span>{booking.hallName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-text-muted" />
                      {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-text-muted" />
                      {booking.time}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Perforated divider */}
          <div className="relative border-t border-dashed border-white/10">
            <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-cinema-base" />
            <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-cinema-base" />
          </div>

          {/* Bottom section with QR and seats */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center">
            {/* QR Code placeholder */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-white rounded-xl p-2.5">
                <div className="grid grid-cols-12 gap-px w-full h-full">
                  {qrPattern.map((filled, i) => (
                    <div key={i} className={`rounded-[1px] ${filled ? 'bg-black' : 'bg-white'}`} />
                  ))}
                </div>
              </div>
              <p className="text-center text-xs text-text-muted mt-2">Scan at entrance</p>
            </div>

            {/* Seats and info */}
            <div className="flex-1 w-full">
              <div className="mb-4">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Seats</p>
                <div className="flex gap-1.5 flex-wrap">
                  {booking.seats.sort().map(seat => (
                    <Badge key={seat} variant="amber" className="text-sm px-3 py-1">{seat}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Booking ID</p>
                  <p className="text-sm font-mono font-medium">{booking.id}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Amount Paid</p>
                  <p className="text-sm font-display font-bold text-accent-primary">${booking.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-8 justify-center">
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="w-4 h-4" /> Print Ticket
        </Button>
        <Link to="/bookings">
          <Button>View My Bookings</Button>
        </Link>
        <Link to="/">
          <Button variant="ghost">
            <Home className="w-4 h-4" /> Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
