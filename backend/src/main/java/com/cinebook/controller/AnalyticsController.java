package com.cinebook.controller;

import com.cinebook.dto.AnalyticsOverviewDTO;
import com.cinebook.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST endpoints for management reporting and analytics.
 * Function 6: Admin Reporting & Analytics Dashboard (IT25101952).
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Autowired
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public AnalyticsOverviewDTO getOverview() {
        return analyticsService.getOverview();
    }
}
