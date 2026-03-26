package com.golf.platform.controller;

import com.golf.platform.dto.ApiResponse;
import com.golf.platform.entity.Draw;
import com.golf.platform.entity.DrawResult;
import com.golf.platform.service.DrawService;
import com.golf.platform.service.DrawLogicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DrawController {

    private final DrawService drawService;
    private final DrawLogicService drawLogicService;

    // ===== Retrieve Draws =====
    @GetMapping("/draws")
    public ResponseEntity<ApiResponse<List<Draw>>> getDraws() {
        return ResponseEntity.ok(ApiResponse.ok(drawService.getAllDraws()));
    }

    @GetMapping("/draws/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDrawDetails(@PathVariable UUID id) {
        return drawService.getDrawById(id)
                .map(draw -> {
                    Map<String, Object> details = new HashMap<>();
                    details.put("draw", draw);
                    details.put("results", drawService.getDrawResults(id));
                    return ResponseEntity.ok(ApiResponse.ok(details));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ===== Draw Configuration & Execution =====

    /**
     * Get available draw configurations and statistics
     */
    @GetMapping("/admin/draws/config")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDrawConfig() {
        BigDecimal prizePool = drawLogicService.calculatePrizePool();
        Map<String, Object> config = new HashMap<>();
        config.put("drawTypes", List.of("random", "algorithmic"));
        config.put("currentPrizePool", prizePool);
        config.put("poolDistribution", Map.of(
                "5-match", prizePool.multiply(new BigDecimal("0.40")),
                "4-match", prizePool.multiply(new BigDecimal("0.35")),
                "3-match", prizePool.multiply(new BigDecimal("0.25"))));
        config.put("matchTypes", List.of("5-match", "4-match", "3-match"));
        return ResponseEntity.ok(ApiResponse.ok(config));
    }

    /**
     * Simulate a draw (no save)
     * 
     * @param drawType "random" or "algorithmic"
     */
    @PostMapping("/admin/draws/simulate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> simulateDraw(
            @RequestParam(defaultValue = "random") String drawType) {
        List<Integer> drawnNumbers = "algorithmic".equalsIgnoreCase(drawType)
                ? drawLogicService.generateWeightedNumbers()
                : drawLogicService.generateRandomNumbers();

        BigDecimal prizePool = drawLogicService.calculatePrizePool();

        Map<String, Object> simulation = new HashMap<>();
        simulation.put("drawnNumbers", drawnNumbers);
        simulation.put("drawType", drawType);
        simulation.put("prizePool", prizePool);
        simulation.put("poolDistribution", Map.of(
                "5-match", prizePool.multiply(new BigDecimal("0.40")),
                "4-match", prizePool.multiply(new BigDecimal("0.35")),
                "3-match", prizePool.multiply(new BigDecimal("0.25"))));
        simulation.put("status", "simulated");

        return ResponseEntity.ok(ApiResponse.ok(simulation));
    }

    /**
     * Execute actual draw with results
     * 
     * @param drawType "random" or "algorithmic"
     */
    @PostMapping("/admin/draws/execute")
    public ResponseEntity<ApiResponse<Map<String, Object>>> executeDraw(
            @RequestParam(defaultValue = "random") String drawType) {

        BigDecimal prizePool = drawLogicService.calculatePrizePool();
        if (prizePool.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No active subscriptions. Cannot execute draw."));
        }

        // Generate draw numbers
        List<Integer> drawnNumbers = "algorithmic".equalsIgnoreCase(drawType)
                ? drawLogicService.generateWeightedNumbers()
                : drawLogicService.generateRandomNumbers();

        // Create draw entity
        Draw draw = Draw.builder()
                .drawDate(LocalDate.now())
                .drawType(drawType)
                .drawNumbers(drawnNumbers.stream()
                        .map(String::valueOf)
                        .reduce((a, b) -> a + "," + b)
                        .orElse(""))
                .prizePool(prizePool)
                .status("completed")
                .build();

        // Execute draw logic and get results
        Map<String, Object> drawResults = drawLogicService.executeDraw(drawnNumbers, prizePool, draw);

        // Save draw
        draw = drawService.saveDraw(draw);

        // Return comprehensive results
        Map<String, Object> response = new HashMap<>();
        response.put("draw", draw);
        response.put("drawResults", drawResults);
        response.put("executedAt", new Date());

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ===== Draw Results & Winners =====

    /**
     * Get all results for a specific draw ordered by match type
     */
    @GetMapping("/admin/draws/{drawId}/results")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDrawResults(
            @PathVariable UUID drawId) {
        List<DrawResult> results = drawService.getDrawResults(drawId);

        Map<String, List<DrawResult>> resultsByType = new HashMap<>();
        resultsByType.put("5-match", new ArrayList<>());
        resultsByType.put("4-match", new ArrayList<>());
        resultsByType.put("3-match", new ArrayList<>());

        for (DrawResult result : results) {
            resultsByType.computeIfAbsent(result.getMatchType(), k -> new ArrayList<>()).add(result);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalResults", results.size());
        response.put("resultsByType", resultsByType);
        response.put("results", results);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * Get winners summary with prize breakdown
     */
    @GetMapping("/admin/draws/{drawId}/winners")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWinnersSummary(
            @PathVariable UUID drawId) {
        Optional<Draw> drawOpt = drawService.getDrawById(drawId);
        if (drawOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Draw draw = drawOpt.get();
        List<DrawResult> results = drawService.getDrawResults(drawId);

        // Count winners by match type
        Map<String, Long> winnerCounts = new HashMap<>();
        winnerCounts.put("5-match", results.stream().filter(r -> "5-match".equals(r.getMatchType())).count());
        winnerCounts.put("4-match", results.stream().filter(r -> "4-match".equals(r.getMatchType())).count());
        winnerCounts.put("3-match", results.stream().filter(r -> "3-match".equals(r.getMatchType())).count());

        // Calculate prizes per winner
        Map<String, BigDecimal> prizePerWinner = new HashMap<>();
        prizePerWinner.put("5-match", drawLogicService.calculatePrizePerWinner(
                draw.getFiveMatchPool(), (int) (long) winnerCounts.get("5-match")));
        prizePerWinner.put("4-match", drawLogicService.calculatePrizePerWinner(
                draw.getFourMatchPool(), (int) (long) winnerCounts.get("4-match")));
        prizePerWinner.put("3-match", drawLogicService.calculatePrizePerWinner(
                draw.getThreeMatchPool(), (int) (long) winnerCounts.get("3-match")));

        Map<String, Object> response = new HashMap<>();
        response.put("draw", draw);
        response.put("totalWinners", results.size());
        response.put("winnerCounts", winnerCounts);
        response.put("prizePerWinner", prizePerWinner);
        response.put("winners", results);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
