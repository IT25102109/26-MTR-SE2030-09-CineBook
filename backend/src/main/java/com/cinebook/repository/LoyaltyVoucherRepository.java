package com.cinebook.repository;

import com.cinebook.model.LoyaltyVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoyaltyVoucherRepository extends JpaRepository<LoyaltyVoucher, Long> {
    List<LoyaltyVoucher> findByUserIdOrderByRedeemedAtDesc(Long userId);
    Optional<LoyaltyVoucher> findByCode(String code);
}
