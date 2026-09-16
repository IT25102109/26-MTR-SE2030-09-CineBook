package com.cinebook.service;

import com.cinebook.model.Showtime;
import com.cinebook.repository.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Business logic for Showtime scheduling & pricing.
 * Function 2: Movie, Showtime & Cinema Management (IT25102109).
 */
@Service
@Transactional
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;

    @Autowired
    public ShowtimeService(ShowtimeRepository showtimeRepository) {
        this.showtimeRepository = showtimeRepository;
    }

    public List<Showtime> getAllShowtimes() {
        return showtimeRepository.findAll();
    }

    public Showtime getShowtimeById(Long id) {
        return showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found with id: " + id));
    }

    public List<Showtime> getShowtimesByMovie(String movieId) {
        return showtimeRepository.findByMovieId(movieId);
    }

    public List<Showtime> getShowtimesByBranch(String branchId) {
        return showtimeRepository.findByBranchId(branchId);
    }

    /**
     * Dynamic Pricing Engine (Function 2):
     * - Weekend screenings (Saturday & Sunday): +20% surge
     * - Peak evening hours (>= 17:00 / 5 PM): +15% surge
     */
    public double calculateDynamicPrice(double basePrice, String dateStr, String timeStr) {
        double multiplier = 1.0;
        try {
            if (dateStr != null && !dateStr.isBlank()) {
                java.time.DayOfWeek day = java.time.LocalDate.parse(dateStr).getDayOfWeek();
                if (day == java.time.DayOfWeek.SATURDAY || day == java.time.DayOfWeek.SUNDAY) {
                    multiplier += 0.20;
                }
            }
            if (timeStr != null && !timeStr.isBlank()) {
                int hour = Integer.parseInt(timeStr.split(":")[0]);
                if (hour >= 17) {
                    multiplier += 0.15;
                }
            }
        } catch (Exception ignored) {}
        return Math.round(basePrice * multiplier * 100.0) / 100.0;
    }

    public Showtime createShowtime(Showtime showtime) {
        if (showtime.getBasePrice() > 0 && showtime.getDate() != null && showtime.getTime() != null) {
            double dynamicBase = calculateDynamicPrice(showtime.getBasePrice(), showtime.getDate(), showtime.getTime());
            showtime.setBasePrice(dynamicBase);
            if (showtime.getPremiumPrice() <= 0) {
                showtime.setPremiumPrice(Math.round(dynamicBase * 1.35 * 100.0) / 100.0);
            }
        }
        return showtimeRepository.save(showtime);
    }

    public Showtime updateShowtime(Long id, Showtime updated) {
        Showtime existing = getShowtimeById(id);
        existing.setMovieId(updated.getMovieId());
        existing.setBranchId(updated.getBranchId());
        existing.setHallId(updated.getHallId());
        existing.setHallName(updated.getHallName());
        existing.setDate(updated.getDate());
        existing.setTime(updated.getTime());
        existing.setBasePrice(updated.getBasePrice());
        existing.setPremiumPrice(updated.getPremiumPrice());
        existing.setBookedSeats(updated.getBookedSeats());
        return showtimeRepository.save(existing);
    }

    public Showtime addBookedSeats(Long id, List<String> newSeats) {
        Showtime existing = getShowtimeById(id);
        List<String> current = existing.getBookedSeats();
        if (current == null) {
            current = new ArrayList<>();
        }
        for (String seat : newSeats) {
            if (!current.contains(seat)) {
                current.add(seat);
            }
        }
        existing.setBookedSeats(current);
        return showtimeRepository.save(existing);
    }

    public void deleteShowtime(Long id) {
        showtimeRepository.deleteById(id);
    }
}
