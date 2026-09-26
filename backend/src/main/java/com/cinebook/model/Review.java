package com.cinebook.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents a customer review for a movie.
 * Mapped to table `reviews` in cinebook_db.
 */
@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "movie_id", nullable = false)
    private Long movieId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(nullable = false)
    private int rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "review_date")
    private LocalDateTime reviewDate;

    @Column(name = "moderation_status", nullable = false)
    private String moderationStatus = "PENDING";

    @JsonProperty("id")
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @JsonSetter("id")
    public void setJsonId(Object rawId) {
        if (rawId == null) {
            this.id = null;
        } else if (rawId instanceof Number number) {
            this.id = number.longValue();
        } else {
            String s = rawId.toString().trim();
            if (s.isEmpty() || !s.matches("\\d+")) {
                this.id = null;
            } else {
                this.id = Long.parseLong(s);
            }
        }
    }

    @JsonProperty("movieId")
    public String getJsonMovieId() {
        return movieId != null ? movieId.toString() : null;
    }

    @JsonSetter("movieId")
    public void setJsonMovieId(Object raw) {
        if (raw == null) {
            this.movieId = 1L;
        } else if (raw instanceof Number number) {
            this.movieId = number.longValue();
        } else {
            String digits = raw.toString().replaceAll("\\D+", "");
            this.movieId = digits.isEmpty() ? 1L : Long.parseLong(digits);
        }
    }

    @JsonProperty("userId")
    public String getJsonUserId() {
        return userId != null ? userId.toString() : null;
    }

    @JsonSetter("userId")
    public void setJsonUserId(Object raw) {
        if (raw == null) {
            this.userId = null;
        } else if (raw instanceof Number number) {
            this.userId = number.longValue();
        } else {
            String digits = raw.toString().replaceAll("\\D+", "");
            this.userId = digits.isEmpty() ? null : Long.parseLong(digits);
        }
    }

    @JsonProperty("createdAt")
    public String getCreatedAt() {
        return reviewDate != null ? reviewDate.toString() : null;
    }

    @JsonSetter("createdAt")
    public void setCreatedAt(String dateStr) {
        if (dateStr != null && !dateStr.isBlank()) {
            try {
                this.reviewDate = LocalDateTime.parse(dateStr.replace("Z", ""));
            } catch (Exception ignored) {
                this.reviewDate = LocalDateTime.now();
            }
        }
    }

    @JsonProperty("status")
    public String getStatus() {
        return moderationStatus != null ? moderationStatus.toLowerCase() : "pending";
    }

    @JsonSetter("status")
    public void setStatus(String status) {
        if (status != null && !status.isBlank()) {
            this.moderationStatus = status.trim().toUpperCase();
        } else {
            this.moderationStatus = "PENDING";
        }
    }

    @PrePersist
    public void prePersist() {
        if (reviewDate == null) {
            reviewDate = LocalDateTime.now();
        }
        if (moderationStatus == null || moderationStatus.isBlank()) {
            moderationStatus = "PENDING";
        }
    }
}
