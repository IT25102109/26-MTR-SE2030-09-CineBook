package com.cinebook.repository;

import com.cinebook.model.RefundRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundRepository extends JpaRepository<RefundRecord, Long> {
    List<RefundRecord> findByBookingId(Long bookingId);
}
