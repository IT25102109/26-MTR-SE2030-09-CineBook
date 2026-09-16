package com.cinebook.controller;

import com.cinebook.model.Showtime;
import com.cinebook.service.ShowtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for showtime scheduling & pricing.
 * Function 2: Movie, Showtime & Cinema Management (IT25102109).
 */
@RestController
@RequestMapping("/api/showtimes")
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    @Autowired
    public ShowtimeController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
    }

    @GetMapping
    public List<Showtime> getAllShowtimes(@RequestParam(required = false) Long movieId,
                                          @RequestParam(required = false) Long branchId) {
        if (movieId != null) {
            return showtimeService.getShowtimesByMovie(movieId);
        }
        if (branchId != null) {
            return showtimeService.getShowtimesByBranch(branchId);
        }
        return showtimeService.getAllShowtimes();
    }

    @GetMapping("/{id}")
    public Showtime getShowtimeById(@PathVariable Long id) {
        return showtimeService.getShowtimeById(id);
    }

    @GetMapping("/movie/{movieId}")
    public List<Showtime> getShowtimesByMovieId(@PathVariable Long movieId) {
        return showtimeService.getShowtimesByMovie(movieId);
    }

    @PostMapping
    public Showtime createShowtime(@RequestBody Showtime showtime) {
        return showtimeService.createShowtime(showtime);
    }

    @PutMapping("/{id}")
    public Showtime updateShowtime(@PathVariable Long id, @RequestBody Showtime showtime) {
        return showtimeService.updateShowtime(id, showtime);
    }

    @PostMapping("/{id}/seats")
    public Showtime addBookedSeats(@PathVariable Long id, @RequestBody List<String> seats) {
        return showtimeService.addBookedSeats(id, seats);
    }

    @DeleteMapping("/{id}")
    public void deleteShowtime(@PathVariable Long id) {
        showtimeService.deleteShowtime(id);
    }
}
