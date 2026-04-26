package com.wealthtracker.controller;

import com.wealthtracker.dto.AuthRequest;
import com.wealthtracker.dto.AuthResponse;
import com.wealthtracker.dto.ForgotPasswordRequest;
import com.wealthtracker.dto.ResetPasswordRequest;
import com.wealthtracker.dto.SignupRequest;
import com.wealthtracker.model.User;
import com.wealthtracker.repository.UserRepository;
import com.wealthtracker.security.JwtUtil;
import com.wealthtracker.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, JwtUtil jwtUtil, UserRepository userRepository) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Validates the current JWT token and returns the authenticated user's profile.
     * When jwt.enabled=true, Spring Security's JwtAuthenticationFilter will reject
     * the request with 401 before reaching here if the token is invalid/expired.
     * When jwt.enabled=false (dev mode), we manually validate for correctness.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.isTokenValid(token)) {
            return ResponseEntity.status(401).body(Map.of("message", "Token expired or invalid"));
        }
        String userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        }
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.sendPasswordResetEmail(request.getEmail());
        return ResponseEntity.ok(Map.of(
                "message", "Password reset email sent. Please check your inbox."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    /**
     * Search registered users by email prefix for adding to expense books.
     * Returns id, email, name only (never password).
     */
    @GetMapping("/search-users")
    public ResponseEntity<List<Map<String, String>>> searchUsers(
            @RequestParam String email, HttpServletRequest request) {
        // Verify authentication
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.isTokenValid(token)) {
            return ResponseEntity.status(401).build();
        }

        if (email == null || email.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }

        String currentUserId = jwtUtil.extractUserId(token);
        String searchTerm = email.trim().toLowerCase();

        // Find all users, filter by email containing the search term, exclude current user
        List<Map<String, String>> results = userRepository.findAll().stream()
                .filter(u -> u.getEmail().toLowerCase().contains(searchTerm))
                .filter(u -> !u.getId().equals(currentUserId))
                .limit(10)
                .map(u -> Map.of(
                        "id", u.getId(),
                        "email", u.getEmail(),
                        "name", u.getName()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }
}
