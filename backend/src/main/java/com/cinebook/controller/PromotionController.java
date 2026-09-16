package com.cinebook.controller;

import com.cinebook.model.Promotion;
import com.cinebook.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for Promotional discount campaign management and validation.
 * Function 2: Movie, Showtime & Cinema Management (IT25102109).
 */
@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    @Autowired
    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping
    public List<Promotion> getAllPromotions() {
        return promotionService.getAllPromotions();
    }

    @PostMapping
    public Promotion createPromotion(@RequestBody Promotion promotion) {
        return promotionService.createPromotion(promotion);
    }

    @PutMapping("/{id}")
    public Promotion updatePromotion(@PathVariable Long id, @RequestBody Promotion promotion) {
        return promotionService.updatePromotion(id, promotion);
    }

    @DeleteMapping("/{id}")
    public void deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validatePromotion(@RequestBody Map<String, Object> payload) {
        String code = (String) payload.get("code");
        Number subtotalNum = (Number) payload.get("subtotal");
        double subtotal = subtotalNum != null ? subtotalNum.doubleValue() : 0.0;

        try {
            double discount = promotionService.calculateDiscount(code, subtotal);
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "code", code,
                    "discount", discount,
                    "finalAmount", Math.max(0, subtotal - discount)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "message", e.getMessage()
            ));
        }
    }
}
