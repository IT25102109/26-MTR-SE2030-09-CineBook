package com.cinebook.service;

import com.cinebook.model.Promotion;
import com.cinebook.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Business logic for Promotional Campaigns & Discount validation.
 * Owned by: Movie, Showtime & Cinema Management module (Function 2 - IT25102109).
 */
@Service
@Transactional
public class PromotionService {

    private final PromotionRepository promotionRepository;

    @Autowired
    public PromotionService(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public Optional<Promotion> getPromotionByCode(String code) {
        return promotionRepository.findByCodeIgnoreCase(code);
    }

    public Promotion createPromotion(Promotion promotion) {
        return promotionRepository.save(promotion);
    }

    public Promotion updatePromotion(Long id, Promotion updated) {
        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));
        existing.setCode(updated.getCode());
        existing.setDescription(updated.getDescription());
        existing.setDiscountType(updated.getDiscountType());
        existing.setDiscountValue(updated.getDiscountValue());
        existing.setMinSpend(updated.getMinSpend());
        existing.setValidUntil(updated.getValidUntil());
        existing.setActive(updated.isActive());
        return promotionRepository.save(existing);
    }

    public void deletePromotion(Long id) {
        promotionRepository.deleteById(id);
    }

    public double calculateDiscount(String code, double subtotal) {
        Optional<Promotion> opt = promotionRepository.findByCodeIgnoreCase(code);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Invalid promotion code: " + code);
        }
        Promotion promo = opt.get();
        if (!promo.isActive()) {
            throw new IllegalStateException("Promotion code is inactive");
        }
        LocalDate expiry = LocalDate.parse(promo.getValidUntil());
        if (expiry.isBefore(LocalDate.now())) {
            throw new IllegalStateException("Promotion code has expired");
        }
        if (subtotal < promo.getMinSpend()) {
            throw new IllegalStateException("Minimum spend of $" + promo.getMinSpend() + " required");
        }

        if ("percentage".equalsIgnoreCase(promo.getDiscountType())) {
            return (subtotal * promo.getDiscountValue()) / 100.0;
        } else {
            return Math.min(promo.getDiscountValue(), subtotal);
        }
    }
}
