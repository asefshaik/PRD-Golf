package com.golf.platform.controller;

import com.golf.platform.dto.ApiResponse;
import com.golf.platform.dto.AuthSyncRequest;
import com.golf.platform.entity.User;
import com.golf.platform.service.EmailService;
import com.golf.platform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final EmailService emailService;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.ok("Backend is running"));
    }

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody AuthSyncRequest request) {
        try {
            // Register endpoint - creates user directly in backend
            // Used when Supabase signup succeeds but email verification is pending
            if (request.getId() == null || request.getEmail() == null) {
                return ResponseEntity.badRequest().body(ApiResponse.<User>error("ID and email are required"));
            }

            User user = userService.syncUser(request);
            return ResponseEntity.ok(ApiResponse
                    .ok("User registered successfully. Please check your email to verify your account.", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<User>error(e.getMessage()));
        }
    }

    @PostMapping("/auth/sync")
    public ResponseEntity<ApiResponse<User>> syncUser(@RequestBody AuthSyncRequest request) {
        try {
            // For signup flow where X-User-Id might not be present
            // We accept the user ID from the request body
            if (request.getId() == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("User ID is required"));
            }

            boolean isNew = userService.getUserById(request.getId()).isEmpty();
            User user = userService.syncUser(request);

            if (isNew) {
                try {
                    emailService.sendWelcomeEmail(user.getEmail(),
                            user.getFullName() != null ? user.getFullName() : "there");
                } catch (Exception e) {
                    // Don't fail the sync if email fails
                    System.err.println("Failed to send welcome email: " + e.getMessage());
                }
            }

            return ResponseEntity.ok(ApiResponse.ok("User synced successfully", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/users/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(@RequestHeader("X-User-Id") UUID userId) {
        return userService.getUserById(userId)
                .map(user -> ResponseEntity.ok(ApiResponse.ok(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/is-admin")
    public ResponseEntity<ApiResponse<Boolean>> isAdmin(@RequestHeader("X-User-Id") UUID userId) {
        try {
            boolean isAdmin = userService.getUserById(userId)
                    .map(user -> "admin".equals(user.getRole()))
                    .orElse(false);
            return ResponseEntity.ok(ApiResponse.ok(isAdmin));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.ok(false));
        }
    }

    @PutMapping("/users/me")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody User updates) {
        try {
            User user = userService.updateUser(userId, updates);
            return ResponseEntity.ok(ApiResponse.ok("User updated", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/admin/promote")
    public ResponseEntity<ApiResponse<User>> promoteToAdmin(
            @RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String secret = body.get("secret");

            if (!"dev-admin-secret-2026".equals(secret)) {
                return ResponseEntity.status(403).body(ApiResponse.<User>error("Invalid secret"));
            }

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.<User>error("Email is required"));
            }

            Optional<User> userOptional = userService.getUserByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User adminUser = userOptional.get();
            adminUser.setRole("admin");
            userService.updateUser(adminUser.getId(), adminUser);

            return ResponseEntity.ok(ApiResponse.ok("User promoted to admin", adminUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<User>error(e.getMessage()));
        }
    }
}
