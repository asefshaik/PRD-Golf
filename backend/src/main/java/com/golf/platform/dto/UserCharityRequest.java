package com.golf.platform.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserCharityRequest {
    private UUID charityId;
    private Integer contributionPct; // Minimum 10
}
