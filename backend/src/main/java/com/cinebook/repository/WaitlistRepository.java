package com.cinebook.repository;

import com.cinebook.model.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {
    List<Waitlist> findByShowtimeId(Long showtimeId);
    Optional<Waitlist> findByShowtimeIdAndUserId(Long showtimeId, Long userId);
    List<Waitlist> findByUserId(Long userId);
}

