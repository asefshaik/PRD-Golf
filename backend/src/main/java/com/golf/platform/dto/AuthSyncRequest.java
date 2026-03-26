package com.golf.platform.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthSyncRequest {
    private UUID id;
    private String email;
    private String fullName;
}
