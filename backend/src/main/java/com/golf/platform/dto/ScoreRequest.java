package com.golf.platform.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ScoreRequest {
    private Integer scoreValue; // 1–45
}
