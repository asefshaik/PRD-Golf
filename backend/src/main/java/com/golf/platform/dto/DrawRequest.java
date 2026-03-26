package com.golf.platform.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DrawRequest {
    private LocalDate drawDate;
    private BigDecimal prizePool;
    private String drawType; // "random" or "weighted"
}
