package com.golf.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "draws")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Draw {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "draw_date", nullable = false)
    private LocalDate drawDate;

    @Column(name = "draw_type")
    @Builder.Default
    private String drawType = "random"; // random or algorithmic (weighted)

    @Column(name = "draw_numbers")
    private String drawNumbers; // Comma-separated or JSON array of drawn numbers

    @Column(name = "prize_pool")
    @Builder.Default
    private BigDecimal prizePool = BigDecimal.ZERO;

    @Column(name = "jackpot_amount")
    @Builder.Default
    private BigDecimal jackpotAmount = BigDecimal.ZERO; // Carries forward if unclaimed

    @Column(name = "five_match_pool")
    @Builder.Default
    private BigDecimal fiveMatchPool = BigDecimal.ZERO;

    @Column(name = "four_match_pool")
    @Builder.Default
    private BigDecimal fourMatchPool = BigDecimal.ZERO;

    @Column(name = "three_match_pool")
    @Builder.Default
    private BigDecimal threeMatchPool = BigDecimal.ZERO;

    @Column(name = "status")
    @Builder.Default
    private String status = "pending"; // pending, completed, cancelled

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
