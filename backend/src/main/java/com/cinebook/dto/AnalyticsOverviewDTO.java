package com.cinebook.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object for Admin executive analytics overview.
 * Function 6: Admin Reporting & Analytics Dashboard (IT25101952).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverviewDTO {
    private double totalRevenue;
    private long totalBookings;
    private long activeMovies;
    private long totalBranches;
}
