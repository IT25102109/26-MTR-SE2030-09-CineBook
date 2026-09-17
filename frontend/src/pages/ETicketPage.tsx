import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, MapPin, Film, Download, Home, ShieldCheck, QrCode, ScanLine, ArrowRight, FileText, Printer, Share2, CalendarPlus, Copy, Check } from 'lucide-react';
import { getBookings } from '@/data/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/contexts/ToastContext';

// Calendar Integration Helpers (Function 5: IT25101655)
export function getGoogleCalendarUrl(booking: { movieTitle: string; branchName: string; hallName: string; date: string; time: string; seats: string[]; id: string }): string {
  try {
    const rawTime = booking.time.split(' ')[0] || '18:00';
    const [hStr, mStr] = rawTime.split(':');
    let h = parseInt(hStr, 10) || 18;
    const m = parseInt(mStr, 10) || 0;
    if (booking.time.toLowerCase().includes('pm') && h < 12) h += 12;
    if (booking.time.toLowerCase().includes('am') && h === 12) h = 0;

    const startDate = new Date(`${booking.date}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`);
    const endDate = new Date(startDate.getTime() + 150 * 60 * 1000);
    const formatG = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('🎬 ' + booking.movieTitle + ' @ ' + booking.branchName)}&dates=${formatG(startDate)}/${formatG(endDate)}&details=${encodeURIComponent('Seats: ' + booking.seats.join(', ') + '\nHall: ' + booking.hallName + '\nBooking Ref: ' + booking.id)}&location=${encodeURIComponent(booking.branchName)}`;
  } catch {
    return 'https://calendar.google.com/';
  }
}

export function downloadIcsFile(booking: { movieTitle: string; branchName: string; hallName: string; date: string; time: string; seats: string[]; id: string }) {
  const rawTime = booking.time.split(' ')[0] || '18:00';
  const [hStr, mStr] = rawTime.split(':');
  let h = parseInt(hStr, 10) || 18;
  const m = parseInt(mStr, 10) || 0;
  if (booking.time.toLowerCase().includes('pm') && h < 12) h += 12;
  if (booking.time.toLowerCase().includes('am') && h === 12) h = 0;

  const start = new Date(`${booking.date}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`);
  const end = new Date(start.getTime() + 150 * 60 * 1000);
  const formatUtc = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CineBook//Movie Screening//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:cinebook-${booking.id}@cinebook.lk`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:🎬 ${booking.movieTitle} at ${booking.branchName}`,
    `DESCRIPTION:Seats: ${booking.seats.join(', ')}\\nHall: ${booking.hallName}\\nBooking Ref: ${booking.id}`,
    `LOCATION:${booking.branchName}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cinebook-${booking.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ETicketPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { toast } = useToast();
  const booking = useMemo(() => getBookings().find(b => b.id === bookingId), [bookingId]);

  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scanStep, setScanStep] = useState<'scanning' | 'verified'>('scanning');
  const [isCheckedIn, setIsCheckedIn] = useState(() => {
    return localStorage.getItem(`cinebook_checkin_${bookingId}`) === 'true';
  });

  const qrPattern = useMemo(() => {
    if (!booking) return [];
    const seed = booking.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const cells: boolean[] = [];
    for (let i = 0; i < 144; i++) {
      cells.push(((seed * (i + 1) * 2654435761) % 2) === 0);
    }
    return cells;
  }, [booking]);

  const handleOpenScanner = () => {
    setShowScannerModal(true);
    setScanStep('scanning');
    setTimeout(() => {
      setScanStep('verified');
      setIsCheckedIn(true);
      if (bookingId) {
        localStorage.setItem(`cinebook_checkin_${bookingId}`, 'true');
      }
    }, 1400);
  };

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
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-display font-bold">Booking Confirmed!</h1>
          {isCheckedIn ? (
            <Badge variant="green" className="text-xs px-2.5 py-0.5 font-mono">
              GATE CHECKED-IN
            </Badge>
          ) : (
            <Badge variant="amber" className="text-xs px-2.5 py-0.5 font-mono">
              VALID TICKET
            </Badge>
          )}
        </div>
        <p className="text-text-secondary">Your e-ticket has been generated. Present this QR code at the cinema entrance turnstile.</p>
      </div>

      <div className="relative animate-scale-in">
        {/* Ticket */}
        <div className="bg-cinema-card hairline rounded-2xl overflow-hidden shadow-soft-xl">
          {/* Top section */}
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <img src={booking.moviePoster} alt={booking.movieTitle} className="w-24 sm:w-28 rounded-xl object-cover shadow-md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="font-display font-bold text-xl sm:text-2xl truncate">{booking.movieTitle}</h2>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono flex-shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> SECURE
                  </div>
                </div>
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
            {/* QR Code */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-32 h-32 bg-white rounded-xl p-2.5 shadow-md relative overflow-hidden group">
                <div className="grid grid-cols-12 gap-px w-full h-full">
                  {qrPattern.map((filled, i) => (
                    <div key={i} className={`rounded-[1px] ${filled ? 'bg-black' : 'bg-white'}`} />
                  ))}
                </div>
                <div className="absolute inset-0 border-2 border-dashed border-accent-primary/50 pointer-events-none rounded-xl" />
              </div>
              <p className="text-center text-xs text-text-muted mt-2 font-mono">Scan at Turnstile</p>
            </div>

            {/* Seats and info */}
            <div className="flex-1 w-full">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-text-muted uppercase tracking-wider">Reserved Seats</p>
                  <span className="text-xs text-text-secondary font-mono">{booking.seats.length} Seat{booking.seats.length > 1 ? 's' : ''}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {booking.seats.sort().map(seat => (
                    <Badge key={seat} variant="amber" className="text-sm px-3 py-1 font-mono font-bold">{seat}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Booking ID</p>
                  <p className="text-sm font-mono font-semibold text-text-primary">{booking.id}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Amount Paid</p>
                  <p className="text-sm font-display font-bold text-accent-primary">${booking.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Turnstile Entry simulation bar */}
          <div className="bg-white/[0.02] border-t border-white/5 px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <QrCode className="w-4 h-4 text-accent-primary" />
              <span>Cinema Gate Turnstile Scanner</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleOpenScanner} className="text-xs py-1.5 h-auto">
              <ScanLine className="w-3.5 h-3.5 text-accent-primary" />
              {isCheckedIn ? 'Re-verify Gate Entry' : 'Simulate Turnstile Scan'}
            </Button>
          </div>
        </div>
      </div>

      {/* Simulator Modal */}
      <Modal
        open={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        title="Turnstile Check-In Simulator"
      >
        <div className="p-4 space-y-6 text-center">
          {scanStep === 'scanning' ? (
            <div className="py-8 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center relative overflow-hidden">
                <ScanLine className="w-10 h-10 text-accent-primary animate-pulse" />
                <div className="absolute inset-x-0 h-1 bg-accent-primary animate-bounce opacity-80" />
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary">Scanning E-Ticket...</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Verifying cryptographic digital payload with {booking.branchName} access gateway turnstile.
              </p>
            </div>
          ) : (
            <div className="py-4 space-y-5 animate-fade-in-up">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>

              <div>
                <Badge variant="green" className="mb-2 px-3 py-1 font-mono text-xs">
                  ENTRY GRANTED • TURNSTILE UNLOCKED
                </Badge>
                <h3 className="font-display font-bold text-xl text-text-primary">{booking.movieTitle}</h3>
                <p className="text-xs text-text-secondary mt-1">
                  {booking.branchName} • {booking.hallName}
                </p>
              </div>

              <div className="bg-cinema-base hairline rounded-xl p-4 text-xs space-y-2 text-left font-mono">
                <div className="flex justify-between">
                  <span className="text-text-muted">Turnstile Lane:</span>
                  <span className="text-text-primary font-bold">Gate 02 (Auditorium Entrance)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Seats Verified:</span>
                  <span className="text-accent-primary font-bold">{booking.seats.sort().join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Timestamp:</span>
                  <span className="text-text-primary">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Verification ID:</span>
                  <span className="text-emerald-400 truncate max-w-[180px]">SIG-{booking.id.toUpperCase()}-VERIFIED</span>
                </div>
              </div>

              <Button fullWidth onClick={() => setShowScannerModal(false)}>
                Done
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Official Tax Invoice Modal (Phase 3 - Function 4: IT25102892) */}
      <Modal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Official Tax Invoice & Receipt"
        size="lg"
        footer={
          <div className="flex justify-between items-center w-full">
            <Button variant="ghost" onClick={() => setShowInvoiceModal(false)}>Close</Button>
            <Button onClick={() => window.print()} className="flex items-center gap-1.5">
              <Printer className="w-4 h-4" /> Print / Save PDF Invoice
            </Button>
          </div>
        }
      >
        <div className="space-y-6 p-2 text-text-primary">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-accent-primary">CineBook Entertainment PLC</h2>
              <p className="text-xs text-text-secondary mt-0.5">National Cinema & Entertainment Network</p>
              <div className="mt-2 text-[11px] font-mono text-text-muted space-y-0.5">
                <p>VAT Reg: <span className="text-text-primary">SL-VAT-2026-9828-CB</span></p>
                <p>Operator License: <span className="text-text-primary">LKR-CINEMA-092-A</span></p>
                <p>Branch: <span className="text-text-primary">{booking.branchName}</span></p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="green" className="text-xs px-2.5 py-1 mb-2 font-mono">
                PAID IN FULL
              </Badge>
              <p className="text-xs font-mono font-bold text-text-primary">INV-{booking.id.toUpperCase()}</p>
              <p className="text-[11px] text-text-muted mt-1">
                Date: {booking.bookingDate || new Date().toISOString().split('T')[0]}
              </p>
            </div>
          </div>

          {/* Customer & Screening Info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-cinema-base hairline">
              <span className="text-text-muted uppercase tracking-wider font-semibold block mb-1">Billed To</span>
              <p className="font-semibold text-text-primary">{booking.userId}</p>
              <p className="text-text-secondary mt-0.5">Payment Method: Digital Gateway</p>
              <p className="text-emerald-400 font-mono mt-1 text-[11px]">Auth: AUTH-{booking.id.slice(-6).toUpperCase()}</p>
            </div>
            <div className="p-3 rounded-xl bg-cinema-base hairline">
              <span className="text-text-muted uppercase tracking-wider font-semibold block mb-1">Screening Summary</span>
              <p className="font-semibold text-text-primary">{booking.movieTitle}</p>
              <p className="text-text-secondary mt-0.5">{booking.hallName} • {booking.seats.length} Seat(s): {booking.seats.sort().join(', ')}</p>
              <p className="text-text-muted mt-1">{booking.date} at {booking.time}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-cinema-base text-text-muted border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Tax Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                <tr>
                  <td className="py-2.5 px-3 font-sans">
                    Cinema Admission Ticket ({booking.movieTitle})
                    <p className="text-[10px] text-text-muted font-mono">{booking.seats.join(', ')}</p>
                  </td>
                  <td className="py-2.5 px-3 text-center">{booking.seats.length}</td>
                  <td className="py-2.5 px-3 text-right">8.0%</td>
                  <td className="py-2.5 px-3 text-right">
                    ${((booking.totalAmount - (booking.seats.length * 1.50)) / 1.08).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans">
                    Turnstile Gate Facility & Digital Booking Surcharge
                  </td>
                  <td className="py-2.5 px-3 text-center">{booking.seats.length}</td>
                  <td className="py-2.5 px-3 text-right">0.0%</td>
                  <td className="py-2.5 px-3 text-right">
                    ${(booking.seats.length * 1.50).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-text-secondary">
                    VAT & Municipal Entertainment Tax (8%)
                  </td>
                  <td className="py-2.5 px-3 text-center">-</td>
                  <td className="py-2.5 px-3 text-right">8.0%</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">
                    ${(booking.totalAmount - ((booking.totalAmount - (booking.seats.length * 1.50)) / 1.08) - (booking.seats.length * 1.50)).toFixed(2)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-cinema-base border-t border-white/10 font-bold">
                <tr>
                  <td colSpan={3} className="py-3 px-3 text-right font-sans">Total Paid (Tax Inclusive):</td>
                  <td className="py-3 px-3 text-right text-accent-primary font-mono text-sm">
                    ${booking.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>This is an official computer-generated tax invoice compliant with Inland Revenue regulations.</span>
            </div>
            <span className="font-mono font-bold text-xs uppercase">E-SEAL VERIFIED</span>
          </div>
        </div>
      </Modal>

      {/* Share with a Friend (Digital Guest Pass) Modal */}
      <Modal
        open={showShareModal}
        onClose={() => { setShowShareModal(false); setCopiedLink(false); }}
        title="Share Digital Guest Pass"
        size="md"
        footer={
          <Button variant="ghost" onClick={() => setShowShareModal(false)}>Close</Button>
        }
      >
        <div className="space-y-4 p-1">
          <p className="text-xs text-text-secondary">
            Send an instant digital pass with the entrance QR code, reserved seats, and venue details to your movie companion.
          </p>

          <div className="p-3.5 rounded-xl bg-cinema-base border border-white/10 space-y-1 text-xs">
            <p className="font-semibold text-text-primary">{booking.movieTitle}</p>
            <p className="text-text-secondary">{booking.branchName} • {booking.hallName}</p>
            <p className="text-accent-primary font-mono">{booking.date} at {booking.time} • Seats: {booking.seats.join(', ')}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">Direct Ticket Link</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={`${window.location.origin}/ticket/${booking.id}?guest=true`}
                className="flex-1 bg-cinema-base border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-text-secondary select-all"
              />
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/ticket/${booking.id}?guest=true`);
                  setCopiedLink(true);
                  toast('success', 'Ticket link copied to clipboard!');
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
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🍿 Hey! Here is our CineBook ticket for ${booking.movieTitle} at ${booking.branchName} on ${booking.date} at ${booking.time}. Seats: ${booking.seats.join(', ')}.\nPass Link: ${window.location.origin}/ticket/${booking.id}?guest=true`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md"
          >
            <Share2 className="w-4 h-4" /> Share via WhatsApp
          </a>
        </div>
      </Modal>

      <div className="flex items-center gap-3 mt-8 justify-center flex-wrap">
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowCalendarMenu(!showCalendarMenu)}
            className="flex items-center gap-1.5"
          >
            <CalendarPlus className="w-4 h-4 text-accent-primary" /> Add to Calendar
          </Button>

          {showCalendarMenu && (
            <div className="absolute left-0 bottom-full mb-2 w-56 bg-cinema-card hairline rounded-xl shadow-xl p-1.5 z-30 space-y-1">
              <a
                href={getGoogleCalendarUrl(booking)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowCalendarMenu(false)}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg text-text-secondary hover:text-text-primary hover:bg-cinema-elevated transition-colors"
              >
                Google Calendar
              </a>
              <button
                type="button"
                onClick={() => {
                  downloadIcsFile(booking);
                  setShowCalendarMenu(false);
                  toast('success', 'iCalendar (.ics) file downloaded');
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg text-text-secondary hover:text-text-primary hover:bg-cinema-elevated transition-colors text-left"
              >
                Download .ics (Apple / Outlook)
              </button>
            </div>
          )}
        </div>

        <Button variant="outline" onClick={() => setShowShareModal(true)} className="flex items-center gap-1.5">
          <Share2 className="w-4 h-4 text-accent-primary" /> Share Ticket
        </Button>
        <Button variant="outline" onClick={() => setShowInvoiceModal(true)} className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-accent-primary" /> Tax Invoice
        </Button>
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
