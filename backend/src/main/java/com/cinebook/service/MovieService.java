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
        return movieRepository.findFirstById(id)
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

        String synopsis = updatedMovie.getSynopsis() != null ? updatedMovie.getSynopsis() : existing.getSynopsis();
        String castCsv = (updatedMovie.getCast() != null && !updatedMovie.getCast().isEmpty())
                ? String.join(",", updatedMovie.getCast())
                : existing.getCastCsv();
        String director = updatedMovie.getDirector() != null ? updatedMovie.getDirector() : existing.getDirector();
        String genresCsv = (updatedMovie.getGenres() != null && !updatedMovie.getGenres().isEmpty())
                ? String.join(",", updatedMovie.getGenres())
                : existing.getGenresCsv();
        String language = updatedMovie.getLanguage() != null ? updatedMovie.getLanguage() : existing.getLanguage();
        double rating = updatedMovie.getRating() > 0 ? updatedMovie.getRating() : existing.getRating();
        int duration = updatedMovie.getDurationMin() > 0
                ? updatedMovie.getDurationMin()
                : (updatedMovie.getDuration() > 0 ? updatedMovie.getDuration() : existing.getDurationMin());
        String certification = updatedMovie.getCertification() != null ? updatedMovie.getCertification() : existing.getCertification();
        String releaseDate = updatedMovie.getReleaseDate() != null ? updatedMovie.getReleaseDate() : existing.getReleaseDate();
        String poster = updatedMovie.getPosterUrl() != null
                ? updatedMovie.getPosterUrl()
                : (updatedMovie.getPoster() != null ? updatedMovie.getPoster() : existing.getPosterUrl());
        String backdrop = updatedMovie.getBackdropUrl() != null
                ? updatedMovie.getBackdropUrl()
                : (updatedMovie.getBackdrop() != null ? updatedMovie.getBackdrop() : existing.getBackdropUrl());
        String trailerUrl = updatedMovie.getTrailerUrl() != null ? updatedMovie.getTrailerUrl() : existing.getTrailerUrl();
        String status = updatedMovie.getStatus() != null ? updatedMovie.getStatus() : existing.getStatus();
        boolean featured = updatedMovie.isFeatured();

        movieRepository.updateMovieComposite(
                id,
                title,
                synopsis,
                castCsv,
                director,
                genresCsv,
                language,
                rating,
                duration,
                certification,
                releaseDate,
                poster,
                backdrop,
                trailerUrl,
                status,
                featured
        );

        return getMovieById(id);
    }

    @Transactional
    public void deleteMovie(Long id) {
        movieRepository.deleteByMovieId(id);
    }
}
