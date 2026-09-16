package com.cinebook.service;

import com.cinebook.dto.AnalyticsOverviewDTO;
import com.cinebook.model.Booking;
import com.cinebook.repository.BookingRepository;
import com.cinebook.repository.CinemaRepository;
import com.cinebook.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Analytics and reporting aggregation service.
 * Function 6: Admin Reporting & Analytics Dashboard (IT25101952).
 */
@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final MovieRepository movieRepository;
    private final CinemaRepository cinemaRepository;

    @Autowired
    public AnalyticsService(BookingRepository bookingRepository,
                            MovieRepository movieRepository,
                            CinemaRepository cinemaRepository) {
        this.bookingRepository = bookingRepository;
        this.movieRepository = movieRepository;
        this.cinemaRepository = cinemaRepository;
    }

    public AnalyticsOverviewDTO getOverview() {
        List<Booking> bookings = bookingRepository.findAll();
        double totalRevenue = bookings.stream()
                .filter(b -> !"cancelled".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        long totalBookings = bookings.size();
        long activeMovies = movieRepository.count();
        long totalBranches = cinemaRepository.count();

        return new AnalyticsOverviewDTO(totalRevenue, totalBookings, activeMovies, totalBranches);
    }
}
