package com.golf.platform.controller;

import com.golf.platform.dto.ApiResponse;
import com.golf.platform.dto.CharityRequest;
import com.golf.platform.dto.UserCharityRequest;
import com.golf.platform.entity.Charity;
import com.golf.platform.entity.UserCharity;
import com.golf.platform.service.CharityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CharityController {

    private final CharityService charityService;

    @GetMapping("/charities")
    public ResponseEntity<ApiResponse<List<Charity>>> getCharities() {
        return ResponseEntity.ok(ApiResponse.ok(charityService.getActiveCharities()));
    }

    @PostMapping("/user-charities")
    public ResponseEntity<ApiResponse<UserCharity>> selectCharity(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody UserCharityRequest request) {
        try {
            UserCharity uc = charityService.selectCharity(
                    userId, request.getCharityId(), request.getContributionPct());
            return ResponseEntity.ok(ApiResponse.ok("Charity selected", uc));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/user-charities")
    public ResponseEntity<ApiResponse<UserCharity>> getUserCharity(
            @RequestHeader("X-User-Id") UUID userId) {
        return charityService.getUserCharity(userId)
                .map(uc -> ResponseEntity.ok(ApiResponse.ok(uc)))
                .orElse(ResponseEntity.ok(ApiResponse.ok("No charity selected", null)));
    }
}
