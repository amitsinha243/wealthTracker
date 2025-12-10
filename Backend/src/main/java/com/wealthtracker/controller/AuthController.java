package com.wealthtracker.controller;

import com.wealthtracker.dto.AuthRequest;
import com.wealthtracker.dto.AuthResponse;
import com.wealthtracker.dto.ForgotPasswordRequest;
import com.wealthtracker.dto.ResetPasswordRequest;
import com.wealthtracker.dto.SignupRequest;
import com.wealthtracker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String resetToken = authService.generateResetToken(request.getEmail());
        // In production, send this token via email instead of returning it
        // For now, we return it so the frontend can use it directly
        return ResponseEntity.ok(Map.of(
            "message", "Password reset token generated",
            "token", resetToken
        ));
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}
