package com.golf.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "winners")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Winner {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "draw_id", nullable = false)
    private UUID drawId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "match_type", nullable = false)
    private String matchType; // "5-match", "4-match", "3-match"

    @Column(name = "prize_amount")
    @Builder.Default
    private BigDecimal prizeAmount = BigDecimal.ZERO;

    @Column(name = "proof_image_url")
    private String proofImageUrl;

    @Column(name = "status")
    @Builder.Default
    private String status = "pending"; // pending, verified, paid, rejected

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
}
