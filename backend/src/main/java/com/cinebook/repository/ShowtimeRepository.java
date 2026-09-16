package com.cinebook.repository;

import com.cinebook.model.Showtime;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovieId(String movieId);
    List<Showtime> findByBranchId(String branchId);
    List<Showtime> findByMovieIdAndBranchId(String movieId, String branchId);
    List<Showtime> findByDate(String date);
    List<Showtime> findByBranchIdAndHallIdAndDate(String branchId, String hallId, String date);

    /**
     * Pessimistic locking for high-concurrency seat reservation (Phase 3 - IT25101943).
     * Locks the showtime row in MySQL with SELECT ... FOR UPDATE until transaction commits.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Showtime s WHERE s.id = :id")
    Optional<Showtime> findByIdWithLock(@Param("id") Long id);
}
