package com.cinebook.controller;

import com.cinebook.model.LoyaltyVoucher;
import com.cinebook.service.LoyaltyVoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loyalty-vouchers")
public class LoyaltyVoucherController {

    private final LoyaltyVoucherService loyaltyVoucherService;

    @Autowired
    public LoyaltyVoucherController(LoyaltyVoucherService loyaltyVoucherService) {
        this.loyaltyVoucherService = loyaltyVoucherService;
    }

    private Long parseNumericId(Object raw) {
        if (raw == null) return 1L;
        if (raw instanceof Number num) return num.longValue();
        String digits = raw.toString().replaceAll("\\D+", "");
        return digits.isEmpty() ? 1L : Long.parseLong(digits);
    }

    @GetMapping
    public List<LoyaltyVoucher> getUserVouchers(@RequestParam Object userId) {
        return loyaltyVoucherService.getUserVouchers(parseNumericId(userId));
    }

    @PostMapping
    public LoyaltyVoucher redeemVoucher(@RequestBody LoyaltyVoucher voucher) {
        return loyaltyVoucherService.redeemVoucher(voucher);
    }
}
