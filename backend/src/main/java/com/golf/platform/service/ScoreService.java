package com.golf.platform.service;

import com.golf.platform.entity.Score;
import com.golf.platform.repository.ScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private final ScoreRepository scoreRepository;

    private static final int MAX_SCORES = 5;
    private static final int MIN_SCORE = 1;
    private static final int MAX_SCORE = 45;

    public Score addScore(UUID userId, int scoreValue) {
        if (scoreValue < MIN_SCORE || scoreValue > MAX_SCORE) {
            throw new RuntimeException("Score must be between " + MIN_SCORE + " and " + MAX_SCORE);
        }

        List<Score> existingScores = scoreRepository.findByUserIdOrderByCreatedAtAsc(userId);

        // If at max capacity, remove the oldest score
        if (existingScores.size() >= MAX_SCORES) {
            Score oldest = existingScores.get(0);
            scoreRepository.delete(oldest);
        }

        Score newScore = Score.builder()
                .userId(userId)
                .scoreValue(scoreValue)
                .playedAt(java.time.LocalDateTime.now())
                .build();

        return scoreRepository.save(newScore);
    }

    public List<Score> getUserScores(UUID userId) {
        return scoreRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getScoreCount(UUID userId) {
        return scoreRepository.countByUserId(userId);
    }
}
