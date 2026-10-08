package com.cinebook.service;

import com.cinebook.model.Movie;
import com.cinebook.model.User;
import com.cinebook.model.WishlistItem;
import com.cinebook.repository.MovieRepository;
import com.cinebook.repository.UserRepository;
import com.cinebook.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    @Autowired
    public WishlistService(WishlistRepository wishlistRepository,
                           UserRepository userRepository,
                           MovieRepository movieRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
    }

    /**
     * Resolves and verifies that the given user identifier corresponds
     * to an existing registered user in the database.
     */
    public User resolveRegisteredUser(Object userIdOrEmail) {
        if (userIdOrEmail == null) {
            throw new IllegalArgumentException("User identifier is required. Only registered users can save to their wishlist.");
        }
        String identifier = userIdOrEmail.toString().trim();
        if (identifier.isBlank()) {
            throw new IllegalArgumentException("User identifier is required. Only registered users can save to their wishlist.");
        }

        // 1. Try lookup by numeric ID
        if (identifier.matches("\\d+")) {
            Long id = Long.parseLong(identifier);
            Optional<User> byId = userRepository.findById(id);
            if (byId.isPresent()) {
                return byId.get();
            }
        }

        // 2. Try lookup by email
        if (identifier.contains("@")) {
            Optional<User> byEmail = userRepository.findByEmailIgnoreCase(identifier.toLowerCase());
            if (byEmail.isPresent()) {
                return byEmail.get();
            }
        }

        // 3. Try stripping non-numeric prefix (e.g. "u_1" -> 1)
        String digits = identifier.replaceAll("\\D+", "");
        if (!digits.isEmpty()) {
            try {
                Long id = Long.parseLong(digits);
                Optional<User> byId = userRepository.findById(id);
                if (byId.isPresent()) {
                    return byId.get();
                }
            } catch (NumberFormatException ignored) {}
        }

        throw new IllegalArgumentException("Only registered users can save movies to their wishlist. Please sign in or register.");
    }

    /**
     * Resolves and verifies that the given movie exists in the database.
     */
    public Movie resolveMovie(Object movieIdRaw) {
        if (movieIdRaw == null) {
            throw new IllegalArgumentException("Movie identifier is required.");
        }
        String identifier = movieIdRaw.toString().trim();
        if (identifier.isBlank()) {
            throw new IllegalArgumentException("Movie identifier is required.");
        }

        // 1. Try numeric ID
        if (identifier.matches("\\d+")) {
            Long id = Long.parseLong(identifier);
            Optional<Movie> byId = movieRepository.findById(id);
            if (byId.isPresent()) {
                return byId.get();
            }
        }

        // 2. Try stripping non-numeric prefix (e.g. "m1" -> 1)
        String digits = identifier.replaceAll("\\D+", "");
        if (!digits.isEmpty()) {
            try {
                Long id = Long.parseLong(digits);
                Optional<Movie> byId = movieRepository.findById(id);
                if (byId.isPresent()) {
                    return byId.get();
                }
            } catch (NumberFormatException ignored) {}
        }

        // 3. Try lookup by title
        Optional<Movie> byTitle = movieRepository.findByTitle(identifier);
        if (byTitle.isPresent()) {
            return byTitle.get();
        }

        throw new IllegalArgumentException("Movie not found for identifier '" + identifier + "'.");
    }

    public List<Long> getWishlistMovieIds(Object userIdOrEmail) {
        User user = resolveRegisteredUser(userIdOrEmail);
        return wishlistRepository.findByUserId(user.getId()).stream()
                .map(WishlistItem::getMovieId)
                .collect(Collectors.toList());
    }

    public List<Movie> getWishlistMovies(Object userIdOrEmail) {
        User user = resolveRegisteredUser(userIdOrEmail);
        List<Long> movieIds = wishlistRepository.findByUserId(user.getId()).stream()
                .map(WishlistItem::getMovieId)
                .collect(Collectors.toList());
        return movieRepository.findAllById(movieIds);
    }

    public boolean isWishlisted(Object userIdOrEmail, Object movieIdRaw) {
        User user = resolveRegisteredUser(userIdOrEmail);
        Movie movie = resolveMovie(movieIdRaw);
        return wishlistRepository.existsByUserIdAndMovieId(user.getId(), movie.getId());
    }

    public boolean toggleWishlist(Object userIdOrEmail, Object movieIdRaw) {
        User user = resolveRegisteredUser(userIdOrEmail);
        Movie movie = resolveMovie(movieIdRaw);

        Optional<WishlistItem> existing = wishlistRepository.findByUserIdAndMovieId(user.getId(), movie.getId());
        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
            return false;
        } else {
            WishlistItem item = new WishlistItem();
            item.setUserId(user.getId());
            item.setMovieId(movie.getId());
            item.setDateAdded(LocalDateTime.now());
            wishlistRepository.save(item);
            return true;
        }
    }

    public boolean addToWishlist(Object userIdOrEmail, Object movieIdRaw) {
        User user = resolveRegisteredUser(userIdOrEmail);
        Movie movie = resolveMovie(movieIdRaw);

        if (!wishlistRepository.existsByUserIdAndMovieId(user.getId(), movie.getId())) {
            WishlistItem item = new WishlistItem();
            item.setUserId(user.getId());
            item.setMovieId(movie.getId());
            item.setDateAdded(LocalDateTime.now());
            wishlistRepository.save(item);
        }
        return true;
    }

    public boolean removeFromWishlist(Object userIdOrEmail, Object movieIdRaw) {
        User user = resolveRegisteredUser(userIdOrEmail);
        Movie movie = resolveMovie(movieIdRaw);
        wishlistRepository.deleteByUserIdAndMovieId(user.getId(), movie.getId());
        return false;
    }
}

