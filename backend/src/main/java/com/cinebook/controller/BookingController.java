package com.cinebook.controller;

import com.cinebook.model.Booking;
import com.cinebook.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for Bookings, Ticket purchases, and Cancellations.
 * Function 4: Payment Processing & E-Ticket (IT25102892)
 * Function 5: Booking History & Refunds (IT25101655)
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/{id}")
    public Booking getBookingById(@PathVariable String id) {
        return bookingService.findByIdOrRef(id);
    }

    @GetMapping("/ref/{ref}")
    public Booking getBookingByRef(@PathVariable String ref) {
        return bookingService.getBookingByRef(ref);
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable String userId) {
        return bookingService.getUserBookings(userId);
    }

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        return bookingService.createBooking(booking);
    }

    @PutMapping("/{id}")
    public Booking updateBooking(@PathVariable String id, @RequestBody Booking updates) {
        return bookingService.updateBooking(id, updates);
    }

    @PutMapping("/{id}/cancel")
    public Booking cancelBooking(
            @PathVariable String id,
            @RequestParam(required = false) Double refundAmount,
            @RequestParam(required = false) String refundStatus) {
        return bookingService.cancelBooking(id, refundAmount, refundStatus);
    }

    @PutMapping("/{id}/reschedule")
    public Booking rescheduleBooking(
            @PathVariable String id,
            @RequestParam String newShowtimeId,
            @RequestParam String newDate,
            @RequestParam String newTime,
            @RequestParam String newHallName) {
        return bookingService.rescheduleBooking(id, newShowtimeId, newDate, newTime, newHallName);
    }
}
