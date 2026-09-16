package com.cinebook.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Promotional discount campaign entity.
 * Owned by: Movie, Showtime & Cinema Management module (Function 2 - IT25102109).
 */
@Entity
@Table(name = "promotions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, length = 20)
    private String discountType; // "percentage" | "flat"

    @Column(nullable = false)
    private double discountValue;

    private double minSpend;

    @Column(nullable = false)
    private String validUntil; // YYYY-MM-DD

    private boolean active = true;
}
