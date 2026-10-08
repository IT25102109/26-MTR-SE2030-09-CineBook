package com.cinebook.repository;

import com.cinebook.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    Optional<Movie> findFirstById(Long id);

    Optional<Movie> findByTitle(String title);

    Optional<Movie> findByIdAndTitle(Long id, String title);

    @Query("SELECT COUNT(m) > 0 FROM Movie m WHERE LOWER(TRIM(m.title)) = LOWER(TRIM(:title))")
    boolean existsByTitleIgnoreCase(@Param("title") String title);

    @Query("SELECT COUNT(m) > 0 FROM Movie m WHERE LOWER(TRIM(m.title)) = LOWER(TRIM(:title)) AND m.id <> :id")
    boolean existsByTitleIgnoreCaseAndIdNot(@Param("title") String title, @Param("id") Long id);

    @Transactional
    @Modifying
    @Query("DELETE FROM Movie m WHERE m.id = :id")
    void deleteByMovieId(@Param("id") Long id);
}
