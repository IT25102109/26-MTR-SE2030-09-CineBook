package com.cinebook.service;

import com.cinebook.model.Cinema;
import com.cinebook.model.CinemaHall;
import com.cinebook.repository.CinemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CinemaService {

    private final CinemaRepository cinemaRepository;

    @Autowired
    public CinemaService(CinemaRepository cinemaRepository) {
        this.cinemaRepository = cinemaRepository;
    }

    public List<Cinema> getAllCinemas() {
        return cinemaRepository.findAll();
    }

    public Cinema getCinemaById(Long id) {
        return cinemaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cinema not found with id: " + id));
    }

    private void populateLocationIfMissing(Cinema cinema) {
        if (cinema.getLocation() == null || cinema.getLocation().isBlank()) {
            if (cinema.getCity() != null && cinema.getAddress() != null) {
                cinema.setLocation(cinema.getCity() + " - " + cinema.getAddress());
            } else if (cinema.getCity() != null) {
                cinema.setLocation(cinema.getCity());
            } else if (cinema.getAddress() != null) {
                cinema.setLocation(cinema.getAddress());
            } else {
                cinema.setLocation(cinema.getName() != null ? cinema.getName() : "Cinema Location");
            }
        }
    }

    public Cinema createCinema(Cinema cinema) {
        populateLocationIfMissing(cinema);
        if (cinema.getHalls() != null) {
            cinema.setTotalHalls(cinema.getHalls().size());
            for (CinemaHall hall : cinema.getHalls()) {
                hall.setCinema(cinema);
            }
        } else {
            cinema.setTotalHalls(0);
        }
        return cinemaRepository.save(cinema);
    }

    public Cinema updateCinema(Long id, Cinema updated) {
        Cinema existing = getCinemaById(id);
        existing.setName(updated.getName());
        existing.setCity(updated.getCity());
        existing.setAddress(updated.getAddress());
        populateLocationIfMissing(updated);
        existing.setLocation(updated.getLocation());

        if (updated.getHalls() != null) {
            existing.getHalls().clear();
            for (CinemaHall hall : updated.getHalls()) {
                existing.addHall(hall);
            }
            existing.setTotalHalls(existing.getHalls().size());
        } else {
            existing.setTotalHalls(0);
        }
        return cinemaRepository.save(existing);
    }

    public void deleteCinema(Long id) {
        cinemaRepository.deleteById(id);
    }
}
