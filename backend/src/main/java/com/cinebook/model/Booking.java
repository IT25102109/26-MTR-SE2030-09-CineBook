package com.cinebook.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Represents a customer ticket booking.
 * Function 4: Payment Processing & E-Ticket Generation (IT25102892) &
 * Function 5: Booking History, Cancellation & Refunds (IT25101655).
 */
@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bookingRef; // e.g. "CB-849201"

    @Column(nullable = false)
    private String userId;

    private String movieId;

    private String movieTitle;

    private String moviePoster;

    private String branchId;

    private String branchName;

    private String hallName;

    private String showtimeId;

    private String date;

    private String time;

    @JsonIgnore
    @Column(length = 1000)
    private String seatsCsv;

    private double totalAmount;

    @Column(nullable = false)
    private String status; // "confirmed" | "cancelled"

    private String refundStatus; // "none" | "pending" | "processed"

    private Double refundAmount;

    private String rescheduledFrom;

    private String paymentMethod; // "card" | "wallet" | "bank"

    private String paymentStatus; // "paid" | "refunded"

    private LocalDateTime createdAt;

    @JsonProperty("id")
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("id")
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

    @JsonProperty("bookingDate")
    public String getBookingDate() {
        return createdAt != null ? createdAt.toString() : null;
    }

    @JsonProperty("bookingDate")
    public void setBookingDate(String dateStr) {
        // preserve existing or let prePersist initialize
    }

    @JsonProperty("seats")
    public List<String> getSeats() {
        if (seatsCsv == null || seatsCsv.isBlank()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(seatsCsv.split("\\s*,\\s*")));
    }

    @JsonProperty("seats")
    public void setSeats(List<String> seats) {
        if (seats == null || seats.isEmpty()) {
            this.seatsCsv = "";
        } else {
            this.seatsCsv = String.join(",", seats);
        }
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "confirmed";
        }
        if (refundStatus == null) {
            refundStatus = "none";
        }
        if (paymentStatus == null) {
            paymentStatus = "paid";
        }
        if (bookingRef == null || bookingRef.isBlank()) {
            bookingRef = "CB-" + ((int) (Math.random() * 900000) + 100000);
        }
    }
}
