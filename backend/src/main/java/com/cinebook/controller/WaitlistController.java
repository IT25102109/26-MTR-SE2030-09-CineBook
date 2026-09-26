package com.cinebook.controller;

import com.cinebook.model.Waitlist;
import com.cinebook.service.WaitlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waitlists")
public class WaitlistController {

    private final WaitlistService waitlistService;

    @Autowired
    public WaitlistController(WaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    @GetMapping
    public List<Waitlist> getWaitlist(@RequestParam Long showtimeId) {
        return waitlistService.getWaitlistByShowtime(showtimeId);
    }

    @PostMapping
    public Waitlist joinWaitlist(@RequestBody Waitlist waitlist) {
        return waitlistService.joinWaitlist(waitlist);
    }

    @DeleteMapping("/{id}")
    public void deleteWaitlist(@PathVariable Long id) {
        waitlistService.removeFromWaitlist(id);
    }
}
