package com.cinebook.repository;

import com.cinebook.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMovieId(Long movieId);
    List<Review> findByMovieIdAndModerationStatus(Long movieId, String moderationStatus);
    List<Review> findAllByOrderByReviewDateDesc();
}

