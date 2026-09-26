package com.cinebook.service;

import com.cinebook.model.LoyaltyVoucher;
import com.cinebook.repository.LoyaltyVoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LoyaltyVoucherService {

    private final LoyaltyVoucherRepository loyaltyVoucherRepository;

    @Autowired
    public LoyaltyVoucherService(LoyaltyVoucherRepository loyaltyVoucherRepository) {
        this.loyaltyVoucherRepository = loyaltyVoucherRepository;
    }

    public List<LoyaltyVoucher> getUserVouchers(Long userId) {
        return loyaltyVoucherRepository.findByUserIdOrderByRedeemedAtDesc(userId);
    }

    public LoyaltyVoucher redeemVoucher(LoyaltyVoucher voucher) {
        voucher.setId(null);
        return loyaltyVoucherRepository.save(voucher);
    }

    public Optional<LoyaltyVoucher> getVoucherByCode(String code) {
        return loyaltyVoucherRepository.findByCode(code);
    }
}

