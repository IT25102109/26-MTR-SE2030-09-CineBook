package com.cinebook.service;

import com.cinebook.model.Movie;
import com.cinebook.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public Movie createMovie(Movie movie) {
        // TODO: add validation, and restrict this to CINEMA_MANAGER/ADMIN roles once security is wired up
        return movieRepository.save(movie);
    }

    public Movie updateMovie(Long id, Movie updatedMovie) {
        Movie existing = getMovieById(id);
        existing.setTitle(updatedMovie.getTitle());
        existing.setSynopsis(updatedMovie.getSynopsis());
        existing.setCast(updatedMovie.getCast());
        existing.setDirector(updatedMovie.getDirector());
        existing.setGenres(updatedMovie.getGenres());
        existing.setLanguage(updatedMovie.getLanguage());
        existing.setRating(updatedMovie.getRating());
        existing.setDurationMin(updatedMovie.getDurationMin() > 0 ? updatedMovie.getDurationMin() : updatedMovie.getDuration());
        existing.setCertification(updatedMovie.getCertification());
        existing.setReleaseDate(updatedMovie.getReleaseDate());
        existing.setPosterUrl(updatedMovie.getPosterUrl() != null ? updatedMovie.getPosterUrl() : updatedMovie.getPoster());
        existing.setBackdropUrl(updatedMovie.getBackdropUrl() != null ? updatedMovie.getBackdropUrl() : updatedMovie.getBackdrop());
        existing.setTrailerUrl(updatedMovie.getTrailerUrl());
        existing.setStatus(updatedMovie.getStatus());
        existing.setFeatured(updatedMovie.isFeatured());
        return movieRepository.save(existing);
    }

    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }
}
