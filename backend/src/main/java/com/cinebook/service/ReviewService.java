package com.cinebook.service;

import com.cinebook.model.Review;
import com.cinebook.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAllByOrderByReviewDateDesc();
    }

    public List<Review> getReviewsByMovie(Long movieId) {
        return reviewRepository.findByMovieId(movieId);
    }

    public List<Review> getApprovedReviewsByMovie(Long movieId) {
        return reviewRepository.findByMovieIdAndModerationStatus(movieId, "APPROVED");
    }

    public Review getReviewById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));
    }

    public Review createReview(Review review) {
        review.setId(null);
        return reviewRepository.save(review);
    }

    public Review updateReviewStatus(Long id, String status) {
        Review review = getReviewById(id);
        review.setStatus(status);
        return reviewRepository.save(review);
    }

    public Review updateReview(Long id, Review updated) {
        Review existing = getReviewById(id);
        if (updated.getRating() > 0) existing.setRating(updated.getRating());
        if (updated.getComment() != null) existing.setComment(updated.getComment());
        if (updated.getUserName() != null) existing.setUserName(updated.getUserName());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        return reviewRepository.save(existing);
    }

    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
}

