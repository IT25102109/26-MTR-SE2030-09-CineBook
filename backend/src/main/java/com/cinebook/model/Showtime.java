package com.cinebook.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Represents a scheduled screening of a Movie at a Cinema branch.
 * Owned by: Movie, Showtime & Cinema Management module (Function 2 - IT25102109).
 */
@Entity
@Table(name = "showtimes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Showtime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String movieId;

    @Column(nullable = false)
    private String branchId;

    private String hallId;

    private String hallName;

    @Column(nullable = false)
    private String date; // YYYY-MM-DD

    @Column(nullable = false)
    private String time; // HH:mm

    private double basePrice;

    private double premiumPrice;

    @JsonIgnore
    @Column(length = 2000)
    private String bookedSeatsCsv;

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

    @JsonProperty("bookedSeats")
    public List<String> getBookedSeats() {
        if (bookedSeatsCsv == null || bookedSeatsCsv.isBlank()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(bookedSeatsCsv.split("\\s*,\\s*")));
    }

    @JsonProperty("bookedSeats")
    public void setBookedSeats(List<String> bookedSeats) {
        if (bookedSeats == null || bookedSeats.isEmpty()) {
            this.bookedSeatsCsv = "";
        } else {
            this.bookedSeatsCsv = String.join(",", bookedSeats);
        }
    }
}
