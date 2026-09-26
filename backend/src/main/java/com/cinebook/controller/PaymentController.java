package com.cinebook.controller;

import com.cinebook.model.Payment;
import com.cinebook.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for Payments & Gateway transaction data.
 * Function 4: Payment Processing & Gateway (IT25102892).
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;

    @Autowired
    public PaymentController(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @GetMapping("/{id}")
    public Payment getPaymentById(@PathVariable Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    @GetMapping("/booking/{bookingId}")
    public List<Payment> getPaymentsByBooking(@PathVariable Long bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }

    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        payment.setId(null);
        return paymentRepository.save(payment);
    }
}
