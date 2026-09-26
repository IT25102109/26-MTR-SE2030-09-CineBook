package com.cinebook.service;

import com.cinebook.model.WishlistItem;
import com.cinebook.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class WishlistService {

    private final WishlistRepository wishlistRepository;

    @Autowired
    public WishlistService(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }

    public List<Long> getWishlistMovieIds(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(WishlistItem::getMovieId)
                .collect(Collectors.toList());
    }

    public boolean isWishlisted(Long userId, Long movieId) {
        return wishlistRepository.findByUserIdAndMovieId(userId, movieId).isPresent();
    }

    public boolean toggleWishlist(Long userId, Long movieId) {
        Optional<WishlistItem> existing = wishlistRepository.findByUserIdAndMovieId(userId, movieId);
        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
            return false;
        } else {
            WishlistItem item = new WishlistItem();
            item.setUserId(userId);
            item.setMovieId(movieId);
            wishlistRepository.save(item);
            return true;
        }
    }
}
