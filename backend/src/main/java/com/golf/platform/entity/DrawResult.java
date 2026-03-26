package com.golf.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "draw_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrawResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "draw_id", nullable = false)
    private UUID drawId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "user_scores")
    private String userScores; // Comma-separated last 5 golf scores

    @Column(name = "matched_count")
    private Integer matchedCount; // 5, 4, or 3

    @Column(name = "matched_scores")
    private String matchedScores; // Which scores matched

    @Column(name = "match_type")
    private String matchType; // "5-match", "4-match", "3-match"

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
