package com.cinebook.repository;

import com.cinebook.model.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovieId(String movieId);
    List<Showtime> findByBranchId(String branchId);
    List<Showtime> findByMovieIdAndBranchId(String movieId, String branchId);
    List<Showtime> findByDate(String date);
    List<Showtime> findByBranchIdAndHallIdAndDate(String branchId, String hallId, String date);
}
