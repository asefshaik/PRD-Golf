package com.golf.platform.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CharityRequest {
    private String name;
    private String description;
    private String logoUrl;
    private Boolean isActive;
}
