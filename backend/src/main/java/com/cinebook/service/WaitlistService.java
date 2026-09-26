package com.cinebook.service;

import com.cinebook.model.Waitlist;
import com.cinebook.repository.WaitlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;

    @Autowired
    public WaitlistService(WaitlistRepository waitlistRepository) {
        this.waitlistRepository = waitlistRepository;
    }

    public List<Waitlist> getWaitlistByShowtime(Long showtimeId) {
        return waitlistRepository.findByShowtimeId(showtimeId);
    }

    public Waitlist joinWaitlist(Waitlist waitlist) {
        waitlist.setId(null);
        Optional<Waitlist> existing = waitlistRepository.findByShowtimeIdAndUserId(
                waitlist.getShowtimeId(), waitlist.getUserId());
        if (existing.isPresent()) {
            return existing.get();
        }
        return waitlistRepository.save(waitlist);
    }

    public Waitlist updateStatus(Long id, String status) {
        Waitlist w = waitlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Waitlist entry not found: " + id));
        w.setStatus(status.toUpperCase());
        return waitlistRepository.save(w);
    }

    public void removeFromWaitlist(Long id) {
        waitlistRepository.deleteById(id);
    }
}
