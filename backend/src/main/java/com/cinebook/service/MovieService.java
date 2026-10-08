package com.cinebook.service;

import com.cinebook.model.Movie;
import com.cinebook.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for movies (List New Movie — UC-02-1, and related CRUD).
 * Keep controllers thin: validation/auth checks belong here, not in the controller.
 */
@Service
public class MovieService {

    private final MovieRepository movieRepository;

    @Autowired
    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + id));
    }

    public Movie getMovieByTitle(String title) {
        return movieRepository.findByTitle(title)
                .orElseThrow(() -> new RuntimeException("Movie not found with title: " + title));
    }

    public Movie getMovieByIdAndTitle(Long id, String title) {
        return movieRepository.findByIdAndTitle(id, title)
                .orElseThrow(() -> new RuntimeException("Movie not found with id: " + id + " and title: " + title));
    }

    @Transactional
    public Movie createMovie(Movie movie) {
        if (movie.getTitle() != null && !movie.getTitle().isBlank()) {
            String title = movie.getTitle().trim();
            if (movieRepository.existsByTitleIgnoreCase(title)) {
                throw new IllegalArgumentException("A movie with title '" + title + "' already exists!");
            }
        }
        movie.setId(null);
        return movieRepository.save(movie);
    }

    @Transactional
    public Movie updateMovie(Long id, Movie updatedMovie) {
        Movie existing = getMovieById(id);

        String title = (updatedMovie.getTitle() != null && !updatedMovie.getTitle().isBlank())
                ? updatedMovie.getTitle().trim()
                : existing.getTitle();

        if (movieRepository.existsByTitleIgnoreCaseAndIdNot(title, id)) {
            throw new IllegalArgumentException("A movie with title '" + title + "' already exists!");
        }

        existing.setTitle(title);
        if (updatedMovie.getSynopsis() != null) {
            existing.setSynopsis(updatedMovie.getSynopsis());
        }
        if (updatedMovie.getCast() != null && !updatedMovie.getCast().isEmpty()) {
            existing.setCast(updatedMovie.getCast());
        }
        if (updatedMovie.getDirector() != null) {
            existing.setDirector(updatedMovie.getDirector());
        }
        if (updatedMovie.getGenres() != null && !updatedMovie.getGenres().isEmpty()) {
            existing.setGenres(updatedMovie.getGenres());
        }
        if (updatedMovie.getLanguage() != null) {
            existing.setLanguage(updatedMovie.getLanguage());
        }
        if (updatedMovie.getRating() > 0) {
            existing.setRating(updatedMovie.getRating());
        }
        int duration = updatedMovie.getDurationMin() > 0
                ? updatedMovie.getDurationMin()
                : (updatedMovie.getDuration() > 0 ? updatedMovie.getDuration() : existing.getDurationMin());
        if (duration > 0) {
            existing.setDurationMin(duration);
        }
        if (updatedMovie.getCertification() != null) {
            existing.setCertification(updatedMovie.getCertification());
        }
        if (updatedMovie.getReleaseDate() != null) {
            existing.setReleaseDate(updatedMovie.getReleaseDate());
        }
        String poster = updatedMovie.getPosterUrl() != null
                ? updatedMovie.getPosterUrl()
                : (updatedMovie.getPoster() != null ? updatedMovie.getPoster() : existing.getPosterUrl());
        if (poster != null) {
            existing.setPosterUrl(poster);
        }
        String backdrop = updatedMovie.getBackdropUrl() != null
                ? updatedMovie.getBackdropUrl()
                : (updatedMovie.getBackdrop() != null ? updatedMovie.getBackdrop() : existing.getBackdropUrl());
        if (backdrop != null) {
            existing.setBackdropUrl(backdrop);
        }
        if (updatedMovie.getTrailerUrl() != null) {
            existing.setTrailerUrl(updatedMovie.getTrailerUrl());
        }
        if (updatedMovie.getStatus() != null) {
            existing.setStatus(updatedMovie.getStatus());
        }
        existing.setFeatured(updatedMovie.isFeatured());

        return movieRepository.save(existing);
    }

    @Transactional
    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }
}
