package com.golf.platform.controller;

import com.golf.platform.dto.*;
import com.golf.platform.entity.*;
import com.golf.platform.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final SubscriptionService subscriptionService;
    private final DrawService drawService;
    private final CharityService charityService;
    private final WinnerService winnerService;
    private final TestDataService testDataService;

    // ===== USER MANAGEMENT =====

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    // ===== SUBSCRIPTION MANAGEMENT =====

    @GetMapping("/subscriptions")
    public ResponseEntity<ApiResponse<List<Subscription>>> getActiveSubscriptions() {
        return ResponseEntity.ok(ApiResponse.ok(subscriptionService.getActiveSubscriptions()));
    }

    // ===== DRAW MANAGEMENT =====

    @PostMapping("/draws")
    public ResponseEntity<ApiResponse<Draw>> executeDraw(@RequestBody DrawRequest request) {
        try {
            Draw draw = drawService.executeDraw(
                    request.getDrawDate(), request.getPrizePool(), request.getDrawType());
            return ResponseEntity.ok(ApiResponse.ok("Draw executed", draw));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== CHARITY MANAGEMENT =====

    @GetMapping("/charities")
    public ResponseEntity<ApiResponse<List<Charity>>> getAllCharities() {
        return ResponseEntity.ok(ApiResponse.ok(charityService.getAllCharities()));
    }

    @PostMapping("/charities")
    public ResponseEntity<ApiResponse<Charity>> createCharity(@RequestBody CharityRequest request) {
        Charity charity = charityService.createCharity(request);
        return ResponseEntity.ok(ApiResponse.ok("Charity created", charity));
    }

    @PutMapping("/charities/{id}")
    public ResponseEntity<ApiResponse<Charity>> updateCharity(
            @PathVariable UUID id, @RequestBody CharityRequest request) {
        try {
            Charity charity = charityService.updateCharity(id, request);
            return ResponseEntity.ok(ApiResponse.ok("Charity updated", charity));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/charities/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCharity(@PathVariable UUID id) {
        charityService.deleteCharity(id);
        return ResponseEntity.ok(ApiResponse.ok("Charity deleted", null));
    }

    // ===== WINNER VERIFICATION =====

    @GetMapping("/winners/pending")
    public ResponseEntity<ApiResponse<List<Winner>>> getPendingVerifications() {
        return ResponseEntity.ok(ApiResponse.ok(winnerService.getPendingVerifications()));
    }

    @PutMapping("/winners/{id}/verify")
    public ResponseEntity<ApiResponse<Winner>> verifyWinner(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> body) {
        boolean approved = body.getOrDefault("approved", false);
        Winner winner = winnerService.verifyWinner(id, approved);
        return ResponseEntity.ok(ApiResponse.ok(
                approved ? "Winner verified" : "Winner rejected", winner));
    }

    @PutMapping("/winners/{id}/pay")
    public ResponseEntity<ApiResponse<Winner>> markAsPaid(@PathVariable UUID id) {
        Winner winner = winnerService.markAsPaid(id);
        return ResponseEntity.ok(ApiResponse.ok("Marked as paid", winner));
    }

    @PutMapping("/winners/{id}/payout")
    public ResponseEntity<ApiResponse<Winner>> markPayoutComplete(@PathVariable UUID id) {
        Winner winner = winnerService.markAsPaid(id);
        return ResponseEntity.ok(ApiResponse.ok("Payout marked as completed", winner));
    }

    @GetMapping("/winners")
    public ResponseEntity<ApiResponse<List<Winner>>> getAllWinners() {
        return ResponseEntity.ok(ApiResponse.ok(winnerService.getAllWinners()));
    }

    // ===== ANALYTICS =====

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics() {
        AnalyticsResponse analytics = AnalyticsResponse.builder()
                .totalUsers(userService.getUserCount())
                .activeSubscriptions(subscriptionService.getActiveSubscriptionCount())
                .totalDraws(drawService.getDrawCount())
                .pendingVerifications(winnerService.getPendingCount())
                .totalCharities(charityService.getCharityCount())
                .totalPrizePool(drawService.getTotalPrizePool())
                .totalCharityContributions(subscriptionService.getTotalCharityContributions())
                .totalWinnersVerified(winnerService.getVerifiedWinnersCount())
                .totalPayoutsMade(winnerService.getPaidWinnersCount())
                .build();
        return ResponseEntity.ok(ApiResponse.ok(analytics));
    }

    // ===== TEST DATA MANAGEMENT =====

    /**
     * Generate 15 test users with subscriptions and golf scores for testing draw logic
     */
    @PostMapping("/test-data/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateTestData() {
        Map<String, Object> result = testDataService.generateTestData();
        return ResponseEntity.ok(ApiResponse.ok("Test data generated successfully", result));
    }

    /**
     * Clear all test data (users, subscriptions, scores)
     */
    @DeleteMapping("/test-data/clear")
    public ResponseEntity<ApiResponse<Map<String, String>>> clearTestData() {
        Map<String, String> result = testDataService.clearTestData();
        return ResponseEntity.ok(ApiResponse.ok("Test data cleared", result));
    }
}
