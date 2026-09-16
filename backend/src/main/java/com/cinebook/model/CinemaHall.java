package com.cinebook.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a specific screening hall inside a Cinema branch.
 * Owned by: Movie, Showtime & Cinema Management module (Function 2 - IT25102109).
 */
@Entity
@Table(name = "cinema_halls")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CinemaHall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g. "Hall A", "IMAX Screen 1"

    @Column(name = "`rows`", nullable = false)
    private int rows;

    @Column(nullable = false)
    private int seatsPerRow;

    private int premiumRows;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_id")
    @JsonBackReference
    private Cinema cinema;
}
