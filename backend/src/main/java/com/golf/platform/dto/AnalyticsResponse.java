package com.golf.platform.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnalyticsResponse {
    private long totalUsers;
    private long activeSubscriptions;
    private long totalDraws;
    private long pendingVerifications;
    private long totalCharities;
    
    // Enhanced analytics
    @Builder.Default
    private BigDecimal totalPrizePool = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal totalCharityContributions = BigDecimal.ZERO;
    
    @Builder.Default
    private long totalWinnersVerified = 0L;
    
    @Builder.Default
    private long totalPayoutsMade = 0L;
}
