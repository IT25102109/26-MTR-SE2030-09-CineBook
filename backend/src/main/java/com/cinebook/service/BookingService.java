package com.cinebook.service;

import com.cinebook.model.Booking;
import com.cinebook.repository.BookingRepository;
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

    @Autowired
    public BookingService(BookingRepository bookingRepository, ShowtimeService showtimeService) {
        this.bookingRepository = bookingRepository;
        this.showtimeService = showtimeService;
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

    public Booking createBooking(Booking booking) {
        // Persist booking record
        Booking saved = bookingRepository.save(booking);

        // Update showtime booked seats in Function 3 inventory
        if (booking.getShowtimeId() != null && booking.getSeats() != null && !booking.getSeats().isEmpty()) {
            try {
                Long stId = Long.parseLong(booking.getShowtimeId());
                showtimeService.addBookedSeats(stId, booking.getSeats());
            } catch (Exception e) {
                // Ignore if showtime ID is non-numeric mock ID or showtime not in DB
            }
        }

        return saved;
    }

    public Booking cancelBooking(Long id) {
        Booking booking = getBookingById(id);
        booking.setStatus("cancelled");
        booking.setPaymentStatus("refunded");

        // Tiered refund calculation:
        // > 24 hours prior to showtime: 100% refund
        // 6 - 24 hours prior: 50% refund
        // < 6 hours prior: 0% refund (non-refundable)
        double refundRate = 1.0;
        try {
            if (booking.getDate() != null && booking.getTime() != null) {
                java.time.LocalDate showDate = java.time.LocalDate.parse(booking.getDate());
                java.time.LocalTime showTime = java.time.LocalTime.parse(booking.getTime());
                java.time.LocalDateTime showDateTime = java.time.LocalDateTime.of(showDate, showTime);
                long hoursUntil = java.time.Duration.between(java.time.LocalDateTime.now(), showDateTime).toHours();
                if (hoursUntil > 24) {
                    refundRate = 1.0;
                } else if (hoursUntil >= 6) {
                    refundRate = 0.5;
                } else {
                    refundRate = 0.0;
                }
            }
        } catch (Exception ignored) {
            refundRate = 1.0;
        }

        double refundAmount = booking.getTotalAmount() * refundRate;
        booking.setRefundAmount(refundAmount);
        booking.setRefundStatus(refundRate > 0 ? "processed" : "none");

        // Release seats from showtime inventory
        if (booking.getShowtimeId() != null && booking.getSeats() != null && !booking.getSeats().isEmpty()) {
            try {
                Long stId = Long.parseLong(booking.getShowtimeId());
                showtimeService.removeBookedSeats(stId, booking.getSeats());
            } catch (Exception ignored) {
            }
        }

        return bookingRepository.save(booking);
    }

    public Booking rescheduleBooking(Long id, Long newShowtimeId, String newDate, String newTime, String newHallName) {
        Booking booking = getBookingById(id);
        String oldDate = booking.getDate();
        String oldTime = booking.getTime();

        // Release seats from old showtime
        if (booking.getShowtimeId() != null && booking.getSeats() != null) {
            try {
                Long oldStId = Long.parseLong(booking.getShowtimeId());
                showtimeService.removeBookedSeats(oldStId, booking.getSeats());
            } catch (Exception ignored) {
            }
        }

        // Add seats to new showtime
        if (booking.getSeats() != null) {
            try {
                showtimeService.addBookedSeats(newShowtimeId, booking.getSeats());
            } catch (Exception ignored) {
            }
        }

        booking.setShowtimeId(String.valueOf(newShowtimeId));
        booking.setDate(newDate);
        booking.setTime(newTime);
        booking.setHallName(newHallName);
        booking.setRescheduledFrom(oldDate + " " + oldTime);

        return bookingRepository.save(booking);
    }
}
