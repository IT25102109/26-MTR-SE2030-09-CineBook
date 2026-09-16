package com.cinebook.repository;

import com.cinebook.model.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovieId(Long movieId);
    List<Showtime> findByBranchId(Long branchId);
    List<Showtime> findByMovieIdAndBranchId(Long movieId, Long branchId);
    List<Showtime> findByDate(String date);
}
