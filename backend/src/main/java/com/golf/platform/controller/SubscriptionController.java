package com.golf.platform.controller;

import com.golf.platform.dto.ApiResponse;
import com.golf.platform.dto.CheckoutRequest;
import com.golf.platform.entity.Subscription;
import com.golf.platform.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<Map<String, String>>> createCheckout(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody CheckoutRequest request) {
        try {
            String checkoutUrl = subscriptionService.createCheckoutSession(userId, request);
            return ResponseEntity.ok(ApiResponse.ok(Map.of("checkoutUrl", checkoutUrl)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Subscription>> getStatus(
            @RequestHeader("X-User-Id") UUID userId) {
        return subscriptionService.getSubscriptionByUserId(userId)
                .map(sub -> ResponseEntity.ok(ApiResponse.ok(sub)))
                .orElse(ResponseEntity.ok(ApiResponse.ok("No subscription found", null)));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<String>> confirmSubscription(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Map<String, String> body) {
        try {
            String planType = body.getOrDefault("planType", "monthly");
            String customerId = body.get("customerId");
            String subscriptionId = body.get("subscriptionId");

            subscriptionService.handleCheckoutCompleted(customerId, subscriptionId, planType, userId);
            return ResponseEntity.ok(ApiResponse.ok("Subscription confirmed", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
