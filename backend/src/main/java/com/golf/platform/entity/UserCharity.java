package com.golf.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_charities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserCharity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "charity_id", nullable = false)
    private UUID charityId;

    @Column(name = "contribution_pct")
    @Builder.Default
    private Integer contributionPct = 10; // Minimum 10%

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
