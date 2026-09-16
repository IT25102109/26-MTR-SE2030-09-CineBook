import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Lock, CreditCard, Ticket, Smartphone, Building2, QrCode, Tag, Check, CheckCircle2, ShieldCheck, Users, Split, Send } from 'lucide-react';
import { getShowtime, getMovie, getBranch, getHall, saveBooking, saveNotification, getUsers, validatePromoCode } from '@/data/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Booking, Promotion } from '@/types';

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

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'transfer'>('card');
  const [processing, setProcessing] = useState(false);

  // Group Split Payment State (Phase 3 - Function 4: IT25102892)
  const [splitPaymentEnabled, setSplitPaymentEnabled] = useState(false);
  const [splitCount, setSplitCount] = useState(2); // 2, 3, 4
  const [splitFriends, setSplitFriends] = useState<Array<{ name: string; contact: string; status: 'pending' | 'authorized' }>>([
    { name: 'Friend 1', contact: '0779876543', status: 'pending' },
  ]);

  // Card fields
  const [cardName, setCardName] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Mobile wallet fields
  const [walletApp, setWalletApp] = useState<'genie' | 'frimi'>('genie');
  const [walletPhone, setWalletPhone] = useState('0771234567');

  // Bank transfer fields
  const [bankRef, setBankRef] = useState('');

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

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
  const grossTotal = subtotal + bookingFee + tax;
  const finalTotal = Math.max(0, grossTotal - discountAmount);
  const perPersonShare = splitPaymentEnabled ? Math.round((finalTotal / splitCount) * 100) / 100 : finalTotal;

  const handleSplitCountChange = (count: number) => {
    setSplitCount(count);
    const newFriends: Array<{ name: string; contact: string; status: 'pending' | 'authorized' }> = [];
    for (let i = 1; i < count; i++) {
      newFriends.push(splitFriends[i - 1] || { name: `Friend ${i}`, contact: '077' + Math.floor(1000000 + Math.random() * 9000000), status: 'pending' });
    }
    setSplitFriends(newFriends);
  };

  const handleSimulateAuthorize = (idx: number) => {
    const updated = [...splitFriends];
    updated[idx] = { ...updated[idx], status: 'authorized' };
    setSplitFriends(updated);
    toast('success', `${updated[idx].name}'s share of $${perPersonShare.toFixed(2)} authorized!`);
  };

  const handleAuthorizeAll = () => {
    setSplitFriends(splitFriends.map(f => ({ ...f, status: 'authorized' })));
    toast('success', `All ${splitFriends.length} friend shares approved!`);
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleApplyPromo = () => {
    if (!promoCodeInput.trim()) {
      toast('error', 'Enter a promotional code');
      return;
    }
    const res = validatePromoCode(promoCodeInput, subtotal);
    if (!res.valid) {
      toast('error', res.message);
      return;
    }
    setAppliedPromo(res.promo || null);
    setDiscountAmount(res.discount);
    toast('success', `${res.message} (-$${res.discount.toFixed(2)})`);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoCodeInput('');
    toast('info', 'Promo code removed');
  };

  const handlePay = () => {
    if (paymentMethod === 'card') {
      if (!cardName.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
        toast('error', 'Please fill in all credit/debit card fields');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        toast('error', 'Please enter a valid 16-digit card number');
        return;
      }
    } else if (paymentMethod === 'transfer') {
      if (!bankRef.trim()) {
        toast('error', 'Please provide a transfer reference number or slip ID');
        return;
      }
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
        totalAmount: finalTotal,
        status: 'confirmed',
        refundStatus: 'none',
        bookingDate: new Date().toISOString().split('T')[0],
      };

      saveBooking(booking);
      setProcessing(false);
      toast('success', 'Payment successful! E-Ticket issued.');

      addNotification({
        type: 'booking_confirmation',
        title: 'Booking Confirmed',
        message: `Your booking for ${movie.title} at ${branch.name} has been confirmed. ${state.seats.length} seats: ${state.seats.sort().join(', ')}. Total Paid: $${finalTotal.toFixed(2)}`,
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
          {/* Group Split Payment Feature (Function 4: IT25102892) */}
          <Card className="p-5 border border-white/10 bg-gradient-to-br from-cinema-card to-cinema-card/60">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                  <Split className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base text-text-primary">Group Split Payment</h3>
                  <p className="text-xs text-text-secondary">Divide ticket costs evenly between friends with instant shares</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSplitPaymentEnabled(!splitPaymentEnabled)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  splitPaymentEnabled
                    ? 'bg-accent-primary text-black border-accent-primary shadow-glow-amber'
                    : 'bg-cinema-base text-text-secondary border-white/10 hover:border-white/20'
                }`}
              >
                {splitPaymentEnabled ? 'Enabled ✓' : 'Enable Split'}
              </button>
            </div>

            {splitPaymentEnabled && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-text-secondary font-medium">Split Between:</span>
                  <div className="flex gap-2">
                    {[2, 3, 4].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleSplitCountChange(n)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                          splitCount === n
                            ? 'bg-accent-primary text-black border-accent-primary'
                            : 'bg-cinema-base text-text-secondary border-white/10 hover:border-white/20'
                        }`}
                      >
                        {n} Friends (${(finalTotal / n).toFixed(2)} ea.)
                      </button>
                    ))}
                  </div>
                </div>

                {/* Per person share highlight */}
                <div className="p-3.5 rounded-xl bg-cinema-base hairline flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-secondary">Equal Share Per Person</p>
                    <p className="text-[11px] text-text-muted">Total divided across {splitCount} payers</p>
                  </div>
                  <span className="text-xl font-display font-bold text-accent-primary">
                    ${perPersonShare.toFixed(2)}
                  </span>
                </div>

                {/* Co-payer friend list */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cinema-base border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="text-xs font-semibold text-text-primary">You (Organizer)</span>
                        <p className="text-[10px] text-text-muted">Primary payment method below</p>
                      </div>
                    </div>
                    <Badge variant="green" className="text-xs">
                      Your Share: ${perPersonShare.toFixed(2)}
                    </Badge>
                  </div>

                  {splitFriends.map((friend, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-cinema-base border border-white/5 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-[140px]">
                        <input
                          type="text"
                          value={friend.name}
                          onChange={e => {
                            const updated = [...splitFriends];
                            updated[idx].name = e.target.value;
                            setSplitFriends(updated);
                          }}
                          placeholder={`Friend ${idx + 1} Name`}
                          className="bg-transparent text-xs font-semibold text-text-primary focus:outline-none w-full border-b border-transparent focus:border-accent-primary/40"
                        />
                        <input
                          type="text"
                          value={friend.contact}
                          onChange={e => {
                            const updated = [...splitFriends];
                            updated[idx].contact = e.target.value;
                            setSplitFriends(updated);
                          }}
                          placeholder="Phone / WhatsApp / Email"
                          className="bg-transparent text-[11px] text-text-muted focus:outline-none w-full mt-0.5"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {friend.status === 'authorized' ? (
                          <Badge variant="green" className="text-[10px] flex items-center gap-1">
                            <Check className="w-3 h-3" /> Paid ${perPersonShare.toFixed(2)}
                          </Badge>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSimulateAuthorize(idx)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Simulate Pay
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted">Status: {splitFriends.filter(f => f.status === 'authorized').length + 1} of {splitCount} Paid</span>
                  <button
                    type="button"
                    onClick={handleAuthorizeAll}
                    className="text-xs text-accent-primary hover:underline font-medium"
                  >
                    Simulate All Friends Approved (Demo)
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Payment Method Selector */}
          <div className="flex gap-2 p-1.5 bg-cinema-card hairline rounded-xl">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                paymentMethod === 'card'
                  ? 'bg-accent-primary text-black font-semibold shadow-md'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Credit/Debit Card
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('wallet')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                paymentMethod === 'wallet'
                  ? 'bg-accent-primary text-black font-semibold shadow-md'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Mobile Wallet
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('transfer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                paymentMethod === 'transfer'
                  ? 'bg-accent-primary text-black font-semibold shadow-md'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4" /> Bank Transfer
            </button>
          </div>

          <Card className="p-6">
            {paymentMethod === 'card' && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard className="w-5 h-5 text-accent-primary" />
                  <h2 className="font-display font-semibold text-lg">Card Details</h2>
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
                  <p className="text-xs text-text-muted">256-bit encrypted checkout. Instant e-ticket generation.</p>
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Smartphone className="w-5 h-5 text-accent-primary" />
                  <h2 className="font-display font-semibold text-lg">Mobile Wallet (Genie / FriMi)</h2>
                </div>

                <div className="flex gap-3 mb-5">
                  <button
                    type="button"
                    onClick={() => setWalletApp('genie')}
                    className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                      walletApp === 'genie'
                        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary font-semibold'
                        : 'border-white/10 text-text-secondary hover:border-white/20'
                    }`}
                  >
                    Dialog Genie
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletApp('frimi')}
                    className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                      walletApp === 'frimi'
                        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary font-semibold'
                        : 'border-white/10 text-text-secondary hover:border-white/20'
                    }`}
                  >
                    Nations FriMi
                  </button>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Mobile Number"
                    placeholder="0771234567"
                    value={walletPhone}
                    onChange={e => setWalletPhone(e.target.value)}
                  />

                  <div className="p-4 bg-cinema-base rounded-xl hairline flex items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-lg p-1.5 flex items-center justify-center flex-shrink-0">
                      <QrCode className="w-full h-full text-black" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Instant QR Payment</h4>
                      <p className="text-xs text-text-muted mt-1">
                        Scan with your {walletApp === 'genie' ? 'Genie' : 'FriMi'} App or authorize the push notification on your device.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'transfer' && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Building2 className="w-5 h-5 text-accent-primary" />
                  <h2 className="font-display font-semibold text-lg">Direct Bank Transfer</h2>
                </div>

                <div className="p-4 rounded-xl bg-cinema-base hairline space-y-2 mb-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Bank:</span>
                    <span className="font-medium text-text-primary">Commercial Bank of Ceylon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Account Name:</span>
                    <span className="font-medium text-text-primary">CineBook Holdings PLC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Account Number:</span>
                    <span className="font-mono font-semibold text-accent-primary">1000 4829 3920</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Branch:</span>
                    <span className="font-medium text-text-primary">Colombo City Centre</span>
                  </div>
                </div>

                <Input
                  label="Transfer Reference / Receipt Number"
                  placeholder="e.g. TRF-98234812"
                  value={bankRef}
                  onChange={e => setBankRef(e.target.value)}
                />
                <p className="text-xs text-text-muted mt-2">
                  Please enter the online banking transaction reference or bank slip code.
                </p>
              </div>
            )}
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

            {/* Promo Code Input */}
            <div className="mb-5 pb-5 border-b border-white/5">
              <label className="text-xs text-text-muted font-medium block mb-1.5">Have a Promo Code?</label>
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-400">{appliedPromo.code}</span>
                      <span className="text-xs text-emerald-300 ml-2">(-${discountAmount.toFixed(2)})</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs text-text-muted hover:text-rose-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code (e.g. MOVIE20)"
                    value={promoCodeInput}
                    onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                    className="uppercase font-mono text-xs"
                  />
                  <Button size="sm" variant="outline" onClick={handleApplyPromo}>
                    Apply
                  </Button>
                </div>
              )}
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
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Promotion Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="font-medium">Total Gross</span>
              <span className="text-2xl font-display font-bold text-accent-primary">${finalTotal.toFixed(2)}</span>
            </div>

            {splitPaymentEnabled && (
              <div className="flex justify-between items-center py-2.5 px-3.5 rounded-xl bg-accent-primary/10 border border-accent-primary/20 mb-4 text-xs">
                <div>
                  <span className="font-semibold text-accent-primary">Your Share ({splitCount} Split)</span>
                  <p className="text-[10px] text-text-muted">Friends pay remaining ${(finalTotal - perPersonShare).toFixed(2)}</p>
                </div>
                <span className="font-display font-bold text-accent-primary text-base">${perPersonShare.toFixed(2)}</span>
              </div>
            )}

            <Button fullWidth size="lg" onClick={handlePay} disabled={processing}>
              {processing ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />{' '}
                  {splitPaymentEnabled ? `Pay Your Share: $${perPersonShare.toFixed(2)}` : `Pay $${finalTotal.toFixed(2)}`}
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
