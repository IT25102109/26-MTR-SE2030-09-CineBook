package com.cinebook.controller;

import com.cinebook.model.Movie;
import com.cinebook.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    @Autowired
    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserWishlist(@PathVariable Object userId) {
        try {
            List<String> movieIds = wishlistService.getWishlistMovieIds(userId).stream()
                    .map(String::valueOf)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(movieIds);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Failed to retrieve wishlist: " + e.getMessage()));
        }
    }

    @GetMapping("/{userId}/movies")
    public ResponseEntity<?> getUserWishlistMovies(@PathVariable Object userId) {
        try {
            List<Movie> movies = wishlistService.getWishlistMovies(userId);
            return ResponseEntity.ok(movies);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Failed to retrieve wishlist movies: " + e.getMessage()));
        }
    }

    @GetMapping("/{userId}/check/{movieId}")
    public ResponseEntity<?> checkWishlist(@PathVariable Object userId, @PathVariable Object movieId) {
        try {
            boolean wishlisted = wishlistService.isWishlisted(userId, movieId);
            return ResponseEntity.ok(Map.of("wishlisted", wishlisted));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/toggle")
    public ResponseEntity<?> toggleWishlist(@RequestBody Map<String, Object> body) {
        try {
            Object userId = body.get("userId") != null ? body.get("userId") : body.get("email");
            Object movieId = body.get("movieId");
            if (userId == null || movieId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "userId and movieId are required."));
            }
            boolean wishlisted = wishlistService.toggleWishlist(userId, movieId);
            return ResponseEntity.ok(Map.of(
                    "wishlisted", wishlisted,
                    "userId", String.valueOf(userId),
                    "movieId", String.valueOf(movieId),
                    "message", wishlisted ? "Added to wishlist" : "Removed from wishlist"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Failed to update wishlist: " + e.getMessage()));
        }
    }

    @PostMapping("/{userId}/toggle/{movieId}")
    public ResponseEntity<?> toggleWishlistPath(@PathVariable Object userId, @PathVariable Object movieId) {
        try {
            boolean wishlisted = wishlistService.toggleWishlist(userId, movieId);
            return ResponseEntity.ok(Map.of(
                    "wishlisted", wishlisted,
                    "userId", String.valueOf(userId),
                    "movieId", String.valueOf(movieId),
                    "message", wishlisted ? "Added to wishlist" : "Removed from wishlist"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Failed to update wishlist: " + e.getMessage()));
        }
    }

    @PostMapping("/{userId}/add/{movieId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Object userId, @PathVariable Object movieId) {
        try {
            wishlistService.addToWishlist(userId, movieId);
            return ResponseEntity.ok(Map.of(
                    "wishlisted", true,
                    "userId", String.valueOf(userId),
                    "movieId", String.valueOf(movieId),
                    "message", "Added to wishlist"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Failed to add to wishlist: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/remove/{movieId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Object userId, @PathVariable Object movieId) {
        try {
            wishlistService.removeFromWishlist(userId, movieId);
            return ResponseEntity.ok(Map.of(
                    "wishlisted", false,
                    "userId", String.valueOf(userId),
                    "movieId", String.valueOf(movieId),
                    "message", "Removed from wishlist"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Failed to remove from wishlist: " + e.getMessage()));
        }
    }
}

