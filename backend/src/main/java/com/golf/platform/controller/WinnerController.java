package com.golf.platform.controller;

import com.golf.platform.dto.ApiResponse;
import com.golf.platform.entity.Winner;
import com.golf.platform.service.WinnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/winners")
@RequiredArgsConstructor
public class WinnerController {

    private final WinnerService winnerService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<Winner>>> getMyWinnings(
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(ApiResponse.ok(winnerService.getUserWinnings(userId)));
    }

    @PostMapping("/{id}/proof")
    public ResponseEntity<ApiResponse<Winner>> uploadProof(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        try {
            String proofUrl = body.get("proofImageUrl");
            Winner winner = winnerService.uploadProof(id, proofUrl);
            return ResponseEntity.ok(ApiResponse.ok("Proof uploaded", winner));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
