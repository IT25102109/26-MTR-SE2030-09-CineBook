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
        booking.setRefundStatus("pending");
        booking.setPaymentStatus("refunded");
        return bookingRepository.save(booking);
    }
}
