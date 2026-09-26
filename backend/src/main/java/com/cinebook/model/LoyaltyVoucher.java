package com.cinebook.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Customer Loyalty Voucher redeemed using points.
 * Mapped to table `loyalty_vouchers` in cinebook_db.
 */
@Entity
@Table(name = "loyalty_vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(name = "points_cost", nullable = false)
    private int pointsCost = 100;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(name = "redeemed_at")
    private LocalDateTime redeemedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

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

    @JsonProperty("redeemedAt")
    public String getJsonRedeemedAt() {
        return redeemedAt != null ? redeemedAt.toString() : null;
    }

    @JsonSetter("redeemedAt")
    public void setJsonRedeemedAt(String dateStr) {
        if (dateStr != null && !dateStr.isBlank()) {
            try {
                this.redeemedAt = LocalDateTime.parse(dateStr.replace("Z", ""));
            } catch (Exception ignored) {
                this.redeemedAt = LocalDateTime.now();
            }
        }
    }

    @JsonProperty("expiresAt")
    public String getJsonExpiresAt() {
        return expiresAt != null ? expiresAt.toString() : null;
    }

    @JsonSetter("expiresAt")
    public void setJsonExpiresAt(String dateStr) {
        if (dateStr != null && !dateStr.isBlank()) {
            try {
                this.expiresAt = LocalDateTime.parse(dateStr.replace("Z", ""));
            } catch (Exception ignored) {
                this.expiresAt = null;
            }
        }
    }

    @PrePersist
    public void prePersist() {
        if (redeemedAt == null) {
            redeemedAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        }
    }
}

