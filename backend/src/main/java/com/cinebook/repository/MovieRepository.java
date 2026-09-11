package com.cinebook.repository;

import com.cinebook.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    // Spring Data JPA gives you save(), findById(), findAll(), deleteById() for free.
    // Add custom queries here as needed, e.g.:
    // List<Movie> findByGenre(String genre);
}
