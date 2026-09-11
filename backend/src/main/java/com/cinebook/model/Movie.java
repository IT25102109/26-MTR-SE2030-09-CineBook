package com.cinebook.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a movie listed on CineBook (e.g. "List New Movie" — UC-02-1).
 * Owned by: Movie/Showtime & Cinema Management module.
 */
@Entity
@Table(name = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String genre;

    private int durationMinutes;

    @Column(length = 2000)
    private String synopsis;

    private String posterUrl;

    private String language;

    private String rating; // e.g. PG, 18+
}
