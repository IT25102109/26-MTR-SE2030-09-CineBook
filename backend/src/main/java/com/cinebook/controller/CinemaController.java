package com.cinebook.controller;

import com.cinebook.model.Cinema;
import com.cinebook.service.CinemaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for Cinema branches and hall configurations.
 * Function 2: Movie, Showtime & Cinema Management (IT25102109).
 */
@RestController
@RequestMapping({"/api/branches", "/api/cinemas"})
public class CinemaController {

    private final CinemaService cinemaService;

    @Autowired
    public CinemaController(CinemaService cinemaService) {
        this.cinemaService = cinemaService;
    }

    @GetMapping
    public List<Cinema> getAllBranches() {
        return cinemaService.getAllCinemas();
    }

    @GetMapping("/{id}")
    public Cinema getBranchById(@PathVariable Long id) {
        return cinemaService.getCinemaById(id);
    }

    @PostMapping
    public Cinema createBranch(@RequestBody Cinema cinema) {
        return cinemaService.createCinema(cinema);
    }

    @PutMapping("/{id}")
    public Cinema updateBranch(@PathVariable Long id, @RequestBody Cinema cinema) {
        return cinemaService.updateCinema(id, cinema);
    }

    @DeleteMapping("/{id}")
    public void deleteBranch(@PathVariable Long id) {
        cinemaService.deleteCinema(id);
    }
}
