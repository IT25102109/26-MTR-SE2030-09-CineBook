package com.cinebook.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Customer Movie Wishlist item.
 * Mapped to table `wishlist_items` in cinebook_db.
 */
@Entity
@Table(name = "wishlist_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "movie_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "movie_id", nullable = false)
    private Long movieId;

    @Column(name = "date_added")
    private LocalDateTime dateAdded;

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

    @JsonProperty("userId")
    public String getJsonUserId() {
        return userId != null ? userId.toString() : "";
    }

    @JsonSetter("userId")
    public void setJsonUserId(Object raw) {
        if (raw == null) {
            this.userId = 1L;
        } else if (raw instanceof Number number) {
            this.userId = number.longValue();
        } else {
            String digits = raw.toString().replaceAll("\\D+", "");
            this.userId = digits.isEmpty() ? 1L : Long.parseLong(digits);
        }
    }

    @JsonProperty("movieId")
    public String getJsonMovieId() {
        return movieId != null ? movieId.toString() : "";
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

    @PrePersist
    public void prePersist() {
        if (dateAdded == null) {
            dateAdded = LocalDateTime.now();
        }
    }
}

