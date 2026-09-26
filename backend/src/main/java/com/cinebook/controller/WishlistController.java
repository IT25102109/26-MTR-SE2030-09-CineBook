package com.cinebook.controller;

import com.cinebook.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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

    private Long parseNumericId(Object raw, Long defaultVal) {
        if (raw == null) return defaultVal;
        if (raw instanceof Number num) return num.longValue();
        String digits = raw.toString().replaceAll("\\D+", "");
        return digits.isEmpty() ? defaultVal : Long.parseLong(digits);
    }

    @GetMapping("/{userId}")
    public List<String> getUserWishlist(@PathVariable Object userId) {
        Long uId = parseNumericId(userId, 1L);
        return wishlistService.getWishlistMovieIds(uId).stream()
                .map(String::valueOf)
                .collect(Collectors.toList());
    }

    @PostMapping("/toggle")
    public Map<String, Object> toggleWishlist(@RequestBody Map<String, Object> body) {
        Long userId = parseNumericId(body.get("userId"), 1L);
        Long movieId = parseNumericId(body.get("movieId"), 1L);
        boolean wishlisted = wishlistService.toggleWishlist(userId, movieId);
        Map<String, Object> res = new HashMap<>();
        res.put("wishlisted", wishlisted);
        res.put("userId", String.valueOf(userId));
        res.put("movieId", String.valueOf(movieId));
        return res;
    }
}

