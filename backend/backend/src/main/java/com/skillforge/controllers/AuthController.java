package com.skillforge.controller;

import com.skillforge.dto.RegisterRequest; // Ensure this matches your DTO package
import com.skillforge.dto.LoginRequest;
import com.skillforge.model.User;
import com.skillforge.repository.UserRepository;
import com.skillforge.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
// ⚠️ Note: Your SecurityConfig handles CORS, but keeping this for safety
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    /**
     * ✅ REGISTER LOGIC
     * Uses RegisterRequest DTO to capture frontend data correctly.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registrationDto) {
        try {
            // Check if password exists in the DTO
            if (registrationDto.getRawPassword() == null || registrationDto.getRawPassword().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
            }

            // Convert DTO to User Entity
            User user = new User();
            user.setName(registrationDto.getFullName());
            user.setEmail(registrationDto.getEmail());
            user.setPassword(registrationDto.getRawPassword()); // AuthService will hash this
            user.setRole(registrationDto.getRole());
            // Add other fields if your User model has them (phone, college)

            authService.register(user);
            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * ✅ LOGIN LOGIC
     * Uses LoginRequest DTO for cleaner mapping.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            String token = authService.login(loginRequest.getEmail(), loginRequest.getPassword());

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "token", token,
                    "role", Optional.ofNullable(user.getRole()).map(String::toUpperCase).orElse("STUDENT"),
                    "email", user.getEmail(),
                    "name", Optional.ofNullable(user.getName()).orElse("User")
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }
    }
}