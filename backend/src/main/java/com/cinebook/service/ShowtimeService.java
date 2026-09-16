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
        validateNoSchedulingConflict(showtime, null);
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
        validateNoSchedulingConflict(updated, id);
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

    /**
     * Conflict Detection Engine (Phase 3 - Function 2):
     * Ensures no two showtimes overlap in the same cinema hall on the same date.
     * Enforces a minimum 2.5-hour duration buffer (screening + turnaround/cleaning).
     */
    public void validateNoSchedulingConflict(Showtime showtime, Long excludeId) {
        if (showtime.getBranchId() == null || showtime.getHallId() == null ||
            showtime.getDate() == null || showtime.getTime() == null) {
            return;
        }

        List<Showtime> sameHallShowtimes = showtimeRepository.findByBranchIdAndHallIdAndDate(
                showtime.getBranchId(), showtime.getHallId(), showtime.getDate());

        int proposedMinutes = parseTimeToMinutes(showtime.getTime());
        int defaultDurationAndBuffer = 150; // 2h movie + 30m cleaning/buffer

        for (Showtime existing : sameHallShowtimes) {
            if (excludeId != null && excludeId.equals(existing.getId())) {
                continue;
            }
            int existingMinutes = parseTimeToMinutes(existing.getTime());
            if (Math.abs(proposedMinutes - existingMinutes) < defaultDurationAndBuffer) {
                String hallLabel = existing.getHallName() != null ? existing.getHallName() : "Selected Hall";
                throw new IllegalArgumentException(String.format(
                    "Scheduling conflict in %s: Existing screening at %s overlaps with proposed time %s (requires 2.5h slot including turnaround).",
                    hallLabel,
                    existing.getTime(),
                    showtime.getTime()
                ));
            }
        }
    }

    private int parseTimeToMinutes(String timeStr) {
        try {
            String[] parts = timeStr.trim().split(":");
            int hours = Integer.parseInt(parts[0]);
            int mins = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
            return hours * 60 + mins;
        } catch (Exception e) {
            return 0;
        }
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

    public Showtime removeBookedSeats(Long id, List<String> seatsToRemove) {
        Showtime existing = getShowtimeById(id);
        List<String> current = existing.getBookedSeats();
        if (current != null && seatsToRemove != null) {
            current.removeAll(seatsToRemove);
            existing.setBookedSeats(current);
            return showtimeRepository.save(existing);
        }
        return existing;
    }

    /**
     * Concurrency & Pessimistic Write Lock Engine (Phase 3 - Function 3: IT25101943).
     * Locks the target Showtime record in the database using SELECT ... FOR UPDATE.
     * Guarantees atomic verification that none of the requested seats are already taken.
     */
    public Showtime reserveSeatsWithPessimisticLock(Long showtimeId, List<String> requestedSeats) {
        Showtime showtime = showtimeRepository.findByIdWithLock(showtimeId)
                .orElseThrow(() -> new RuntimeException("Showtime not found: " + showtimeId));

        List<String> current = showtime.getBookedSeats();
        if (current == null) {
            current = new ArrayList<>();
        }

        for (String seat : requestedSeats) {
            if (current.contains(seat)) {
                throw new IllegalStateException("Concurrency conflict: Seat " + seat + " was just booked by another customer.");
            }
        }

        current.addAll(requestedSeats);
        showtime.setBookedSeats(current);
        return showtimeRepository.save(showtime);
    }

    public void deleteShowtime(Long id) {
        showtimeRepository.deleteById(id);
    }
}
