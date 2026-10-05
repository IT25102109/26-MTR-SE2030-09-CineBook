package com.cinebook.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Maps individual seat reservations to table `booked_seats`.
 */
@Entity
@Table(name = "booked_seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookedSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long bookingId;

    private Long seatId;

    @Column(nullable = false, length = 10)
    private String seatCode;

    private double priceCharged;

    @Column(nullable = false)
    private String seatStatus; // "reserved", "confirmed", "released", "cancelled"

    @PrePersist
    public void prePersist() {
        if (seatStatus == null || seatStatus.isBlank()) {
            seatStatus = "confirmed";
        }
    }
}

