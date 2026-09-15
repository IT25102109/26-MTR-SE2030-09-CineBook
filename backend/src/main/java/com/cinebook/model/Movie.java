package com.cinebook.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents a movie listed on CineBook (e.g. "List New Movie" — UC-02-1).
 * Owned by: Movie/Showtime & Cinema Management module.
 *
 * Field shape matches the existing frontend `Movie` type in
 * frontend/src/types.ts exactly, so no adapter/mapping layer is needed
 * between the API response and the UI.
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

    @Column(length = 2000)
    private String synopsis;

    // Stored as a comma-separated string in the DB, exposed as a real
    // array in the JSON response/request (see getCast/setCast below).
    @JsonIgnore
    @Column(length = 1000)
    private String castCsv;

    private String director;

    // Same comma-separated pattern as cast.
    @JsonIgnore
    @Column(length = 500)
    private String genresCsv;

    private String language;

    private double rating; // 0–10 scale, e.g. IMDb-style

    private int durationMin;

    private String certification; // e.g. "PG-13", "R"

    private String releaseDate; // ISO date string, e.g. "2026-07-03"

    private String posterUrl;

    private String backdropUrl;

    private String trailerUrl;

    @Column(nullable = false)
    private String status; // "now_showing" | "coming_soon"

    private boolean featured;

    @JsonProperty("poster")
    public String getPoster() {
        return posterUrl;
    }

    @JsonProperty("poster")
    public void setPoster(String poster) {
        this.posterUrl = poster;
    }

    @JsonProperty("backdrop")
    public String getBackdrop() {
        return backdropUrl;
    }

    @JsonProperty("backdrop")
    public void setBackdrop(String backdrop) {
        this.backdropUrl = backdrop;
    }

    @JsonProperty("duration")
    public int getDuration() {
        return durationMin;
    }

    @JsonProperty("duration")
    public void setDuration(int duration) {
        this.durationMin = duration;
    }

    @JsonProperty("genre")
    public List<String> getGenre() {
        return getGenres();
    }

    @JsonProperty("genre")
    public void setGenre(List<String> genre) {
        setGenres(genre);
    }

    @Transient
    public List<String> getCast() {
        return castCsv == null || castCsv.isBlank() ? List.of() : List.of(castCsv.split("\\s*,\\s*"));
    }

    public void setCast(List<String> cast) {
        this.castCsv = cast == null ? null : String.join(",", cast);
    }

    @Transient
    public List<String> getGenres() {
        return genresCsv == null || genresCsv.isBlank() ? List.of() : List.of(genresCsv.split("\\s*,\\s*"));
    }

    public void setGenres(List<String> genres) {
        this.genresCsv = genres == null ? null : String.join(",", genres);
    }
}
