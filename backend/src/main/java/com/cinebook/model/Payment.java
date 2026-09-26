package com.cinebook.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents a payment transaction for a customer booking.
 * Maps to table `payments` in cinebook_db.
 * Function 4: Payment Processing (IT25102892).
 */
@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long bookingId;

    @Column(nullable = false)
    private double amount;

    @Column(nullable = false)
    private String method; // "CARD", "WALLET", "ONLINE_BANKING", "CASH"

    @Column(nullable = false)
    private String status; // "PENDING", "SUCCESS", "FAILED", "REFUNDED"

    private String gatewayRef;

    @Column(columnDefinition = "TEXT")
    private String qrCode;

    private String checkInStatus; // "NOT_CHECKED_IN", "CHECKED_IN"

    @Column(columnDefinition = "TEXT")
    private String transactionData;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "SUCCESS";
        }
        if (method == null || method.isBlank()) {
            method = "CARD";
        }
        if (checkInStatus == null || checkInStatus.isBlank()) {
            checkInStatus = "NOT_CHECKED_IN";
        }
        if (gatewayRef == null || gatewayRef.isBlank()) {
            gatewayRef = "PAY-" + System.currentTimeMillis();
        }
    }
}
