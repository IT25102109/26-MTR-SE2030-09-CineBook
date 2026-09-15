import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Ticket, Film, X, AlertCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { getUserBookings, updateBooking, saveNotification, getUsers } from '@/data/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { Booking } from '@/types';

export function MyBookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [tick, setTick] = useState(0);

  const bookings = useMemo(() => {
    if (!user) return [];
    return getUserBookings(user.id).sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  }, [user, tick]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Ticket className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-display mb-4">Sign in to view your bookings</h1>
        <Link to="/"><Button>Go Home</Button></Link>
      </div>
    );
  }

  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.date) >= new Date(new Date().toDateString()));
  const past = bookings.filter(b => b.status === 'cancelled' || new Date(b.date) < new Date(new Date().toDateString()));

  const confirmCancel = () => {
    if (!cancelTarget) return;
    updateBooking(cancelTarget.id, { status: 'cancelled', refundStatus: 'pending' });
    setCancelTarget(null);
    setTick(t => t + 1);
    toast('success', 'Booking cancelled. Refund is being processed.');

    addNotification({
      type: 'cancellation_refund',
      title: 'Booking Cancelled',
      message: `Your booking for ${cancelTarget.movieTitle} has been cancelled. A refund of ${cancelTarget.totalAmount.toFixed(2)} is being processed.`,
    });

    const allUsers = getUsers();
    const managers = allUsers.filter(u => u.role === 'cinemaManager' && u.id !== user?.id);
    managers.forEach(m => {
      saveNotification({
        id: `n${Date.now()}_${m.id}`,
        type: 'cancellation_refund',
        title: 'Booking Cancelled',
        message: `A booking for ${cancelTarget.movieTitle} at ${cancelTarget.branchName} has been cancelled. Refund pending.`,
        userId: m.id,
        read: false,
        createdAt: new Date().toISOString(),
        status: 'sent',
      });
    });
  };

  const renderBookingCard = (booking: Booking) => {
    const isPast = new Date(booking.date) < new Date(new Date().toDateString());
    const isCancelled = booking.status === 'cancelled';

    return (
      <Card key={booking.id} hover className="overflow-hidden animate-fade-in-up">
        <div className="flex flex-col sm:flex-row">
          <div className="flex-shrink-0">
            <img src={booking.moviePoster} alt={booking.movieTitle} className="w-full sm:w-28 h-40 sm:h-full object-cover" />
          </div>
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-display font-semibold text-lg mb-1">{booking.movieTitle}</h3>
                <p className="text-sm text-text-muted">{booking.branchName} • {booking.hallName}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {isCancelled ? (
                  <Badge variant="red">Cancelled</Badge>
                ) : isPast ? (
                  <Badge variant="default">Completed</Badge>
                ) : (
                  <Badge variant="green">Upcoming</Badge>
                )}
                {booking.refundStatus === 'pending' && <Badge variant="amber">Refund Pending</Badge>}
                {booking.refundStatus === 'processed' && <Badge variant="blue">Refunded</Badge>}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-text-secondary mb-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-text-muted" />
                {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-text-muted" />
                {booking.time}
              </span>
              <span className="flex items-center gap-1.5">
                <Film className="w-4 h-4 text-text-muted" />
                {booking.seats.join(', ')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-text-muted">{booking.seats.length} {booking.seats.length === 1 ? 'seat' : 'seats'}</span>
                <span className="ml-2 font-display font-bold text-accent-primary">${booking.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                {!isCancelled && !isPast && (
                  <>
                    <Link to={`/ticket/${booking.id}`}>
                      <Button size="sm" variant="outline">View Ticket</Button>
                    </Link>
                    <Button size="sm" variant="destructive" onClick={() => setCancelTarget(booking)}>
                      <X className="w-3.5 h-3.5" /> Cancel
                    </Button>
                  </>
                )}
                {isCancelled && booking.refundStatus === 'pending' && (
                  <Badge variant="amber"><RotateCcw className="w-3 h-3" /> Refund Processing</Badge>
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
      <h1 className="text-3xl font-display font-bold mb-2">My Bookings</h1>
      <p className="text-text-secondary mb-8">Manage your upcoming and past cinema bookings</p>

      {bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Ticket className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
          <p className="text-sm text-text-muted mb-6">Browse movies and book your first ticket!</p>
          <Link to="/movies"><Button>Browse Movies</Button></Link>
        </Card>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xl font-display font-semibold mb-4">Upcoming</h2>
              <div className="space-y-4">{upcoming.map(renderBookingCard)}</div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-xl font-display font-semibold mb-4">History</h2>
              <div className="space-y-4">{past.map(renderBookingCard)}</div>
            </section>
          )}
        </div>
      )}

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Booking?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>Keep Booking</Button>
            <Button variant="destructive" onClick={confirmCancel}>Yes, Cancel & Refund</Button>
          </>
        }
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-accent-destructive" />
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-2">
              You're about to cancel your booking for <span className="font-medium text-text-primary">{cancelTarget?.movieTitle}</span> on{' '}
              {cancelTarget && new Date(cancelTarget.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {cancelTarget?.time}.
            </p>
            <p className="text-sm text-text-secondary">
              A refund of <span className="font-medium text-accent-primary">${cancelTarget?.totalAmount.toFixed(2)}</span> will be processed to your original payment method.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
