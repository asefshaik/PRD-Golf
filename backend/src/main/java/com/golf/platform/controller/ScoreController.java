package com.golf.platform.controller;

import com.golf.platform.dto.ApiResponse;
import com.golf.platform.dto.ScoreRequest;
import com.golf.platform.entity.Score;
import com.golf.platform.service.ScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    @PostMapping
    public ResponseEntity<ApiResponse<Score>> addScore(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody ScoreRequest request) {
        try {
            Score score = scoreService.addScore(userId, request.getScoreValue());
            return ResponseEntity.ok(ApiResponse.ok("Score added", score));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Score>>> getScores(
            @RequestHeader("X-User-Id") UUID userId) {
        List<Score> scores = scoreService.getUserScores(userId);
        return ResponseEntity.ok(ApiResponse.ok(scores));
    }
}
