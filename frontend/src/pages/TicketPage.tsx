import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Printer, Home, Ticket, Calendar, Clock, MapPin } from 'lucide-react';
import { store } from '@/data/store';
import type { Booking, Movie, CinemaHall, CinemaBranch } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// Simple QR-like placeholder pattern generator
function QrPlaceholder({ data }: { data: string }) {
  const size = 12;
  const cells: boolean[] = [];
  let hash = 0;
  for (let i = 0; i < data.length; i++) hash = (hash * 31 + data.charCodeAt(i)) >>> 0;
  for (let i = 0; i < size * size; i++) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    cells.push((hash & 1) === 1);
  }
  return (
    <div className="inline-block bg-white p-3 rounded-xl">
      <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {cells.map((on, i) => (
          <div key={i} className={`w-3 h-3 ${on ? 'bg-ink-950' : 'bg-white'}`} />
        ))}
      </div>
    </div>
  );
}

export function TicketPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [hall, setHall] = useState<CinemaHall | null>(null);
  const [branch, setBranch] = useState<CinemaBranch | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    const bk = store.getBookings().find((b) => b.id === bookingId) ?? null;
    setBooking(bk);
    if (bk) {
      setMovie(store.getMovies().find((m) => m.id === bk.movieId) ?? null);
      setHall(store.getHalls().find((h) => h.id === bk.hallId) ?? null);
      setBranch(store.getBranches().find((b) => b.id === bk.branchId) ?? null);
    }
  }, [bookingId]);

  if (!booking || !movie || !hall || !branch) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-ink-400 mb-4">Booking not found.</p>
        <Link to="/movies"><Button>Browse Movies</Button></Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8 max-w-2xl">
      {/* Success header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/15 mb-4">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold mb-1">Booking Confirmed!</h1>
        <p className="text-ink-400">Your e-ticket has been generated. Show this at the cinema entrance.</p>
      </div>

      {/* E-ticket */}
      <Card className="overflow-hidden animate-scale-in" >
        {/* Ticket header */}
        <div className="bg-gradient-to-r from-accent/20 to-gold/10 p-6 flex items-center gap-4">
          <img src={movie.posterUrl} alt={movie.title} className="w-16 h-24 rounded-lg object-cover shadow-card" />
          <div>
            <Badge variant="success" className="mb-2">Confirmed</Badge>
            <h2 className="text-xl font-bold">{movie.title}</h2>
            <p className="text-sm text-ink-300">{branch.name}</p>
          </div>
        </div>

        {/* Ticket body */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <div className="text-xs text-ink-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</div>
              <div className="font-medium">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-ink-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Time</div>
              <div className="font-medium">{booking.time}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-ink-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> Hall</div>
              <div className="font-medium">{hall.name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-ink-400 flex items-center gap-1"><Ticket className="w-3 h-3" /> Seats</div>
              <div className="font-medium">{booking.seats.join(', ')}</div>
            </div>
          </div>

          {/* QR + booking ID */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl bg-ink-800/50 border border-dashed border-ink-500">
            <QrPlaceholder data={booking.id} />
            <div className="text-center sm:text-left">
              <div className="text-xs text-ink-400 mb-1">Booking ID</div>
              <div className="font-mono text-sm font-semibold mb-3">{booking.id}</div>
              <div className="text-xs text-ink-400 mb-1">Total Paid</div>
              <div className="text-lg font-bold text-accent">${booking.total.toFixed(2)}</div>
              <div className="text-xs text-ink-400 mt-1">{booking.paymentMethod}</div>
            </div>
          </div>
        </div>

        {/* Perforated edge */}
        <div className="flex justify-between px-6">
          <div className="w-6 h-6 rounded-full bg-ink-950 -translate-x-3" />
          <div className="w-6 h-6 rounded-full bg-ink-950 translate-x-3" />
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print Ticket
          </Button>
          <Button variant="outline" onClick={() => {
            const text = `CineBook Ticket\n${movie.title}\n${branch.name}\n${booking.date} ${booking.time}\nSeats: ${booking.seats.join(', ')}\nID: ${booking.id}`;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `cinebook-ticket-${booking.id}.txt`; a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="w-4 h-4" /> Download
          </Button>
          <Link to="/bookings"><Button><Home className="w-4 h-4" /> My Bookings</Button></Link>
        </div>
      </Card>
    </div>
  );
}
