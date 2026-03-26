package com.golf.platform.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckoutRequest {
    private String planType; // "monthly" or "yearly"
    private String successUrl;
    private String cancelUrl;
}
