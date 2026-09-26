package com.cinebook.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents a system or user notification.
 * Mapped to table `notifications` in cinebook_db.
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    private String link;

    @Column(length = 50)
    private String audience = "all";

    @Column(name = "audience_target", length = 100)
    private String audienceTarget;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(length = 20)
    private String status = "sent";

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

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

    @JsonProperty("userId")
    public String getJsonUserId() {
        return userId != null ? userId.toString() : "";
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

    @JsonProperty("read")
    public boolean isRead() {
        return read;
    }

    @JsonSetter("read")
    public void setRead(boolean read) {
        this.read = read;
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
            status = "sent";
        }
        if (audience == null || audience.isBlank()) {
            audience = "all";
        }
    }
}
