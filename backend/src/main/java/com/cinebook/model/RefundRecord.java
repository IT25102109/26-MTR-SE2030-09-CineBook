package com.cinebook.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Maps refund records to table `refunds`.
 * Function 5: Refunds (IT25101655).
 */
@Entity
@Table(name = "refunds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefundRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long bookingId;

    @Column(nullable = false)
    private double refundAmount;

    private LocalDateTime requestDate;

    @Column(columnDefinition = "TEXT")
    private String processedData;

    @Column(nullable = false)
    private String status; // "PENDING", "PROCESSED", "REJECTED"

    private String reason;

    private double deductionAmount;

    @PrePersist
    public void prePersist() {
        if (requestDate == null) {
            requestDate = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "PROCESSED";
        }
        if (reason == null || reason.isBlank()) {
            reason = "Customer requested cancellation";
        }
    }
}
