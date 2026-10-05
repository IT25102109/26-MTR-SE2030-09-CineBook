package com.cinebook.repository;

import com.cinebook.model.Movie;
import com.cinebook.model.MovieId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, MovieId> {

    Optional<Movie> findFirstById(Long id);

    Optional<Movie> findByTitle(String title);

    Optional<Movie> findByIdAndTitle(Long id, String title);

    @Transactional
    @Modifying
    @Query("DELETE FROM Movie m WHERE m.id = :id")
    void deleteByMovieId(@Param("id") Long id);

    @Transactional
    @Modifying
    @Query("UPDATE Movie m SET m.title = :title, m.synopsis = :synopsis, m.castCsv = :castCsv, " +
           "m.director = :director, m.genresCsv = :genresCsv, m.language = :language, " +
           "m.rating = :rating, m.durationMin = :durationMin, m.certification = :certification, " +
           "m.releaseDate = :releaseDate, m.posterUrl = :posterUrl, m.backdropUrl = :backdropUrl, " +
           "m.trailerUrl = :trailerUrl, m.status = :status, m.featured = :featured " +
           "WHERE m.id = :id")
    int updateMovieComposite(@Param("id") Long id,
                             @Param("title") String title,
                             @Param("synopsis") String synopsis,
                             @Param("castCsv") String castCsv,
                             @Param("director") String director,
                             @Param("genresCsv") String genresCsv,
                             @Param("language") String language,
                             @Param("rating") double rating,
                             @Param("durationMin") int durationMin,
                             @Param("certification") String certification,
                             @Param("releaseDate") String releaseDate,
                             @Param("posterUrl") String posterUrl,
                             @Param("backdropUrl") String backdropUrl,
                             @Param("trailerUrl") String trailerUrl,
                             @Param("status") String status,
                             @Param("featured") boolean featured);
}
