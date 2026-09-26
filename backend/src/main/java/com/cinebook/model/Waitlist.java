package com.cinebook.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Customer Waitlist entry for sold-out showtimes.
 * Mapped to table `waitlists` in cinebook_db.
 */
@Entity
@Table(name = "waitlists")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Waitlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "showtime_id", nullable = false)
    private Long showtimeId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "seats_requested", nullable = false)
    private int seatsRequested = 1;

    @Column(nullable = false)
    private String status = "WAITING";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

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

    @JsonProperty("showtimeId")
    public String getJsonShowtimeId() {
        return showtimeId != null ? showtimeId.toString() : "";
    }

    @JsonSetter("showtimeId")
    public void setJsonShowtimeId(Object raw) {
        if (raw == null) {
            this.showtimeId = 1L;
        } else if (raw instanceof Number number) {
            this.showtimeId = number.longValue();
        } else {
            String digits = raw.toString().replaceAll("\\D+", "");
            this.showtimeId = digits.isEmpty() ? 1L : Long.parseLong(digits);
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

    @JsonProperty("createdAt")
    public String getJsonCreatedAt() {
        return createdAt != null ? createdAt.toString() : null;
    }

    @JsonSetter("createdAt")
    public void setJsonCreatedAt(String dateStr) {
        if (dateStr != null && !dateStr.isBlank()) {
            try {
                this.createdAt = LocalDateTime.parse(dateStr.replace("Z", ""));
            } catch (Exception ignored) {
                this.createdAt = LocalDateTime.now();
            }
        }
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "WAITING";
        }
    }
}
