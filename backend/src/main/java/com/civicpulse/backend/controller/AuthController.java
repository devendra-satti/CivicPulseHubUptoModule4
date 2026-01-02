package com.civicpulse.backend.controller;

import com.civicpulse.backend.model.User;
import com.civicpulse.backend.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.civicpulse.backend.services.OtpService;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController //All methods inside AuthController(REST API controller) returns JSON responses
@RequestMapping("/api/auth")  //Prefix for all methods(/signup -> /api/auth/signup)
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    //Phase 3
    @Autowired
    private OtpService otpService; // <--- 1. INJECT OTP SERVICE

    @Value("${app.jwt.secret}") //Reads jwt token value from application.properties
    private String jwtSecret;

    // --- NEW ENDPOINT: SEND OTP ---(PHASE 3)
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String type = request.get("type"); // <--- NEW: Read type from Frontend

        if (email == null || type == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and Type are required"));
        }

        boolean emailExists = userRepository.findByEmail(email).isPresent();

        // <--- NEW: LOGIC BRANCHING --->
        if ("SIGNUP".equals(type)) {
            // Case 1: Signup - We only send OTP if email is NEW
            if (emailExists) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already exists. Please login."));
            }
        } else if ("RESET".equals(type)) {
            // Case 2: Reset Password - We only send OTP if email EXISTS
            if (!emailExists) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email not found. Cannot reset password."));
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP type."));
        }

        otpService.generateAndSendOtp(email);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    // --- NEW ENDPOINT: VERIFY OTP (Immediate Check) ---
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        boolean isValid = otpService.verifyOtp(email, otp);
        
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "OTP Verified Successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or Expired OTP"));
        }
    }

    // --- SIGNUP ENDPOINT ---
    @PostMapping("/signup") //Below method runs when frontend send POST /signup
    public ResponseEntity<?> signup(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        // 1. SECURITY CHECK: Is Email Verified?
        if (!otpService.isEmailVerified(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email not verified. Please verify OTP first."));
        }

        // 2. Check if email already exists (Double check)
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        // 2. Create new User
        User user = new User();
        user.setName(request.get("name"));
        user.setEmail(request.get("email"));
        user.setPassword(passwordEncoder.encode(request.get("password"))); // Encrypt password
        
        //In Phase 2 Added for roles
        String role = request.get("role").toUpperCase();
        user.setRole(role);

        if ("CITIZEN".equals(role)) {
            user.setWardNumber(request.get("wardNumber"));
            user.setEnabled(true); // Citizens are auto-approved
        } else if ("OFFICER".equals(role)) {
            user.setDepartment(request.get("department"));
            user.setEnabled(false); // Officers must wait for Admin approval
        } else {
            // Fallback or Admin creation via API
            user.setEnabled(true);
        }

        // 3. Save to Database
        userRepository.save(user);

        // 5. CLEANUP: Remove verification status so it can't be reused(Phase 3)
        otpService.clearVerification(email);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    // --- SIGNIN ENDPOINT ---
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody Map<String, String> request) {
        // 1. Find User by Email
        Optional<User> userOpt = userRepository.findByEmail(request.get("email"));

        // 2. Check Password
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(request.get("password"), user.getPassword())) {
                
                // 2. CHECK IF APPROVED (Enabled) - PHASE 2 ADDED
                if (!user.isEnabled()) {
                    return ResponseEntity.status(403).body(Map.of("message", "Account pending Admin approval."));
                }
                // 3. Generate JWT Token
                String token = Jwts.builder()
                        .setSubject(user.getEmail())
                        .setIssuedAt(new Date())
                        .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1min expiry
                        .signWith(SignatureAlgorithm.HS256, jwtSecret)
                        .compact();

                // 4. Return Data to Frontend
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId().toString());
                response.put("name", user.getName());
                response.put("email", user.getEmail());
                response.put("role", user.getRole());
                response.put("token", token);
                
                //PHASE-2
                response.put("department", user.getDepartment());
                response.put("wardNumber", user.getWardNumber());

                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        // 1. Check if the email was actually verified by the OtpService
        boolean isVerified = otpService.isEmailVerified(request.getEmail());

        if (!isVerified) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Email not verified. Please verify OTP first.");
        }

        // 2. Check if user exists in DB
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Update Password (Remember to Hash it!)
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // 4. Clear verification status so they can't use it again immediately
        otpService.clearVerification(request.getEmail());

        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }
}