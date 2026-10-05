package com.cinebook.repository;

import com.cinebook.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBookingId(Long bookingId);
    Optional<Payment> findFirstByBookingIdOrderByCreatedAtDesc(Long bookingId);
    List<Payment> findByStatus(String status);
}

