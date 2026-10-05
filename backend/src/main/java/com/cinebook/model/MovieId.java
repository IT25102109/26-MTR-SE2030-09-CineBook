package com.cinebook.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

/**
 * Composite Primary Key for the Movie entity.
 * Composed of generated ID and Movie Title.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieId implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String title;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MovieId movieId = (MovieId) o;
        return Objects.equals(id, movieId.id) && Objects.equals(title, movieId.title);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title);
    }
}
