package com.cinebook.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a cinema branch/location.
 * Owned by: Movie, Showtime & Cinema Management module (Function 2 - IT25102109).
 */
@Entity
@Table(name = "cinemas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cinema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String city;

    private String address;

    private String location;

    @Column(name = "total_halls")
    private int totalHalls;

    @OneToMany(mappedBy = "cinema", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<CinemaHall> halls = new ArrayList<>();

    @PrePersist
    @PreUpdate
    public void ensureDefaults() {
        if (location == null || location.isBlank()) {
            if (city != null && address != null) {
                location = city + " - " + address;
            } else if (city != null) {
                location = city;
            } else if (address != null) {
                location = address;
            } else {
                location = name != null ? name : "Cinema Location";
            }
        }
        if (halls != null) {
            this.totalHalls = halls.size();
        }
    }

    public int getTotalHalls() {
        return halls != null && !halls.isEmpty() ? halls.size() : totalHalls;
    }

    public void addHall(CinemaHall hall) {
        if (halls == null) {
            halls = new ArrayList<>();
        }
        halls.add(hall);
        hall.setCinema(this);
    }

    public void removeHall(CinemaHall hall) {
        if (halls != null) {
            halls.remove(hall);
            hall.setCinema(null);
        }
    }
}
