package com.cinebook.service;

import com.cinebook.model.BookedSeat;
import com.cinebook.model.Booking;
import com.cinebook.model.Payment;
import com.cinebook.model.RefundRecord;
import com.cinebook.repository.BookedSeatRepository;
import com.cinebook.repository.BookingRepository;
import com.cinebook.repository.PaymentRepository;
import com.cinebook.repository.RefundRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for Booking creation, payment confirmation, and cancellation.
 * Function 4 (IT25102892) & Function 5 (IT25101655).
 */
@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowtimeService showtimeService;
    private final PaymentRepository paymentRepository;
    private final BookedSeatRepository bookedSeatRepository;
    private final RefundRepository refundRepository;

    @Autowired
    public BookingService(
            BookingRepository bookingRepository,
            ShowtimeService showtimeService,
            PaymentRepository paymentRepository,
            BookedSeatRepository bookedSeatRepository,
            RefundRepository refundRepository) {
        this.bookingRepository = bookingRepository;
        this.showtimeService = showtimeService;
        this.paymentRepository = paymentRepository;
        this.bookedSeatRepository = bookedSeatRepository;
        this.refundRepository = refundRepository;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    public Booking getBookingByRef(String ref) {
        return bookingRepository.findByBookingRef(ref)
                .orElseThrow(() -> new RuntimeException("Booking not found with ref: " + ref));
    }

    public Booking findByIdOrRef(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new RuntimeException("Booking identifier cannot be empty");
        }
        try {
            Long id = Long.parseLong(identifier.trim());
            java.util.Optional<Booking> opt = bookingRepository.findById(id);
            if (opt.isPresent()) {
                return opt.get();
            }
        } catch (NumberFormatException ignored) {
        }
        return bookingRepository.findByBookingRef(identifier.trim())
                .orElseThrow(() -> new RuntimeException("Booking not found with id or ref: " + identifier));
    }

    public Booking createBooking(Booking booking) {
        booking.setId(null);
        if (booking.getBookingRef() == null || booking.getBookingRef().isBlank()) {
            booking.setBookingRef("CB-" + ((int) (Math.random() * 900000) + 100000));
        }
        if (booking.getStatus() == null || booking.getStatus().isBlank()) {
            booking.setStatus("confirmed");
        }
        if (booking.getPaymentStatus() == null || booking.getPaymentStatus().isBlank()) {
            booking.setPaymentStatus("paid");
        }
        if (booking.getRefundStatus() == null || booking.getRefundStatus().isBlank()) {
            booking.setRefundStatus("none");
        }
        if (booking.getPaymentMethod() == null || booking.getPaymentMethod().isBlank()) {
            booking.setPaymentMethod("card");
        }
        if (booking.getCreatedAt() == null) {
            booking.setCreatedAt(java.time.LocalDateTime.now());
        }

        // 1. Persist booking record
        Booking saved = bookingRepository.save(booking);

        // 2. Persist payment record into `payments` table
        try {
            Payment payment = new Payment();
            payment.setBookingId(saved.getId());
            payment.setAmount(saved.getTotalAmount());
            payment.setMethod(normalizePaymentMethod(saved.getPaymentMethod()));
            payment.setStatus("SUCCESS");
            payment.setGatewayRef("PAY-" + saved.getBookingRef());
            payment.setQrCode(saved.getBookingRef());
            payment.setCheckInStatus("NOT_CHECKED_IN");
            payment.setTransactionData("{\"bookingRef\":\"" + saved.getBookingRef() + "\",\"movie\":\"" + (saved.getMovieTitle() != null ? saved.getMovieTitle().replace("\"", "'") : "") + "\"}");
            payment.setCreatedAt(java.time.LocalDateTime.now());
            paymentRepository.save(payment);
        } catch (Exception ignored) {
        }

        // 3. Persist individual seats into `booked_seats` table
        if (saved.getSeats() != null && !saved.getSeats().isEmpty()) {
            try {
                double pricePerSeat = saved.getSeats().size() > 0 ? saved.getTotalAmount() / saved.getSeats().size() : 0.0;
                for (String seatCode : saved.getSeats()) {
                    BookedSeat bs = new BookedSeat();
                    bs.setBookingId(saved.getId());
                    bs.setSeatCode(seatCode);
                    bs.setPriceCharged(Math.round(pricePerSeat * 100.0) / 100.0);
                    bs.setSeatStatus("confirmed");
                    bookedSeatRepository.save(bs);
                }
            } catch (Exception ignored) {
            }
        }

        // 4. Update showtime booked seats in Function 3 inventory (idempotently)
        if (booking.getShowtimeId() != null && booking.getSeats() != null && !booking.getSeats().isEmpty()) {
            try {
                Long stId = Long.parseLong(booking.getShowtimeId());
                showtimeService.addBookedSeats(stId, booking.getSeats());
            } catch (Exception ignored) {
            }
        }

        return saved;
    }

    public Booking cancelBooking(String identifier, Double explicitRefundAmount, String explicitRefundStatus) {
        Booking booking = findByIdOrRef(identifier);
        booking.setStatus("cancelled");
        booking.setPaymentStatus("refunded");

        if (explicitRefundAmount != null && explicitRefundAmount >= 0) {
            booking.setRefundAmount(explicitRefundAmount);
            booking.setRefundStatus(explicitRefundStatus != null && !explicitRefundStatus.isBlank()
                    ? explicitRefundStatus
                    : (explicitRefundAmount > 0 ? "processed" : "none"));
        } else {
            // Tiered refund calculation:
            // > 24 hours prior to showtime: 100% refund
            // 6 - 24 hours prior: 50% refund
            // < 6 hours prior: 0% refund (non-refundable)
            double refundRate = calculateRefundRate(booking.getDate(), booking.getTime());
            double refundAmount = Math.round(booking.getTotalAmount() * refundRate * 100.0) / 100.0;
            booking.setRefundAmount(refundAmount);
            booking.setRefundStatus(refundRate > 0 ? "processed" : "none");
        }

        // 1. Release seats from showtime inventory
        if (booking.getShowtimeId() != null && booking.getSeats() != null && !booking.getSeats().isEmpty()) {
            try {
                Long stId = Long.parseLong(booking.getShowtimeId());
                showtimeService.removeBookedSeats(stId, booking.getSeats());
            } catch (Exception ignored) {
            }
        }

        // 2. Update payment status to REFUNDED in `payments` table
        try {
            paymentRepository.findByBookingId(booking.getId()).forEach(p -> {
                p.setStatus("REFUNDED");
                paymentRepository.save(p);
            });
        } catch (Exception ignored) {
        }

        // 3. Insert refund record into `refunds` table if refund was approved
        if (booking.getRefundAmount() != null && booking.getRefundAmount() > 0) {
            try {
                RefundRecord refund = new RefundRecord();
                refund.setBookingId(booking.getId());
                refund.setRefundAmount(booking.getRefundAmount());
                refund.setRequestDate(java.time.LocalDateTime.now());
                refund.setStatus("PROCESSED");
                refund.setReason("Customer requested cancellation");
                refund.setDeductionAmount(Math.max(0, Math.round((booking.getTotalAmount() - booking.getRefundAmount()) * 100.0) / 100.0));
                refund.setProcessedData("{\"bookingRef\":\"" + booking.getBookingRef() + "\",\"autoTier\":\"processed\"}");
                refundRepository.save(refund);
            } catch (Exception ignored) {
            }
        }

        // 4. Update booked seats in `booked_seats` table to 'cancelled'
        try {
            List<BookedSeat> seats = bookedSeatRepository.findByBookingId(booking.getId());
            for (BookedSeat s : seats) {
                s.setSeatStatus("cancelled");
                bookedSeatRepository.save(s);
            }
        } catch (Exception ignored) {
        }

        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(Long id) {
        return cancelBooking(String.valueOf(id), null, null);
    }

    public Booking rescheduleBooking(String identifier, String newShowtimeId, String newDate, String newTime, String newHallName) {
        Booking booking = findByIdOrRef(identifier);
        String oldDate = booking.getDate();
        String oldTime = booking.getTime();

        // Release seats from old showtime
        if (booking.getShowtimeId() != null && booking.getSeats() != null && !booking.getSeats().isEmpty()) {
            try {
                Long oldStId = Long.parseLong(booking.getShowtimeId());
                showtimeService.removeBookedSeats(oldStId, booking.getSeats());
            } catch (Exception ignored) {
            }
        }

        // Add seats to new showtime
        if (newShowtimeId != null && booking.getSeats() != null && !booking.getSeats().isEmpty()) {
            try {
                Long stId = Long.parseLong(newShowtimeId);
                showtimeService.addBookedSeats(stId, booking.getSeats());
            } catch (Exception ignored) {
            }
        }

        booking.setShowtimeId(newShowtimeId);
        booking.setDate(newDate);
        booking.setTime(newTime);
        booking.setHallName(newHallName);
        booking.setRescheduledFrom(oldDate + " " + oldTime);

        return bookingRepository.save(booking);
    }

    public Booking rescheduleBooking(Long id, Long newShowtimeId, String newDate, String newTime, String newHallName) {
        return rescheduleBooking(String.valueOf(id), String.valueOf(newShowtimeId), newDate, newTime, newHallName);
    }

    public Booking updateBooking(String identifier, Booking updates) {
        Booking booking = findByIdOrRef(identifier);
        if (updates.getStatus() != null) booking.setStatus(updates.getStatus());
        if (updates.getRefundStatus() != null) booking.setRefundStatus(updates.getRefundStatus());
        if (updates.getRefundAmount() != null) booking.setRefundAmount(updates.getRefundAmount());
        if (updates.getPaymentStatus() != null) booking.setPaymentStatus(updates.getPaymentStatus());
        if (updates.getRescheduledFrom() != null) booking.setRescheduledFrom(updates.getRescheduledFrom());
        return bookingRepository.save(booking);
    }

    private double calculateRefundRate(String dateStr, String timeStr) {
        if (dateStr == null || timeStr == null || dateStr.isBlank() || timeStr.isBlank()) {
            return 1.0;
        }
        try {
            java.time.LocalDate showDate = java.time.LocalDate.parse(dateStr.trim());
            java.time.LocalTime showTime;
            String cleanTime = timeStr.trim().toUpperCase();
            if (cleanTime.endsWith("AM") || cleanTime.endsWith("PM")) {
                java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("h:mm a", java.util.Locale.ENGLISH);
                showTime = java.time.LocalTime.parse(cleanTime, dtf);
            } else {
                showTime = java.time.LocalTime.parse(cleanTime);
            }
            java.time.LocalDateTime showDateTime = java.time.LocalDateTime.of(showDate, showTime);
            long hoursUntil = java.time.Duration.between(java.time.LocalDateTime.now(), showDateTime).toHours();
            if (hoursUntil > 24) {
                return 1.0;
            } else if (hoursUntil >= 6) {
                return 0.5;
            } else {
                return 0.0;
            }
        } catch (Exception e) {
            return 1.0;
        }
    }

    private String normalizePaymentMethod(String method) {
        if (method == null || method.isBlank()) return "CARD";
        String m = method.trim().toUpperCase();
        if (m.contains("WALLET") || m.contains("GENIE") || m.contains("FRIMI")) return "WALLET";
        if (m.contains("TRANSFER") || m.contains("BANK") || m.contains("ONLINE")) return "ONLINE_BANKING";
        if (m.contains("CASH")) return "CASH";
        return "CARD";
    }
}
