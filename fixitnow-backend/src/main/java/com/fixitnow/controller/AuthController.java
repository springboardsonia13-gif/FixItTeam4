package com.fixitnow.controller;

import com.fixitnow.dto.AuthRequest;
import com.fixitnow.dto.AuthResponse;
import com.fixitnow.model.Role;
import com.fixitnow.model.User;
import com.fixitnow.repository.UserRepository;
import com.fixitnow.service.JwtService;
import com.fixitnow.service.TokenBlacklistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // keep for development; tighten in production
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          BCryptPasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          org.springframework.security.core.userdetails.UserDetailsService userDetailsService,
                          TokenBlacklistService tokenBlacklistService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password required"));
        }
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        try {
            if (req.getRole() != null) user.setRole(Role.valueOf(req.getRole().toUpperCase()));
            else user.setRole(Role.CUSTOMER);
        } catch (Exception ex) {
            user.setRole(Role.CUSTOMER);
        }
        user.setLocation(req.getLocation());
        userRepository.save(user);

        // Return some useful info (no password)
        return ResponseEntity.ok(Map.of(
                "message", "User registered",
                "email", user.getEmail(),
                "role", user.getRole().name()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        // First, check if the email exists so we can distinguish messages
        var existingUserOpt = userRepository.findByEmail(req.getEmail());
        if (existingUserOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email"));
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(Map.of("error", "Wrong password"));
        }

        // load UserDetails (for token generation) and also fetch User entity to get role
        UserDetails ud = userDetailsService.loadUserByUsername(req.getEmail());

        // fetch full user record to include role and optional other fields
        var userOpt = userRepository.findByEmail(req.getEmail());
        if (userOpt.isEmpty()) {
            // unexpected, but handle gracefully
            String accessFallback = jwtService.generateAccessToken(ud);
            String refreshFallback = jwtService.generateRefreshToken(ud);
            return ResponseEntity.ok(new AuthResponse(accessFallback, refreshFallback, null));
        }

        User user = userOpt.get();

        String access = jwtService.generateAccessToken(ud);
        String refresh = jwtService.generateRefreshToken(ud);

        // return access, refresh and role
        AuthResponse response = new AuthResponse(access, refresh, user.getRole() != null ? user.getRole().name() : null);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null) return ResponseEntity.status(400).body(Map.of("error", "refreshToken required"));
        String userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail == null) return ResponseEntity.status(401).body(Map.of("error", "Invalid refresh token"));
        UserDetails ud = userDetailsService.loadUserByUsername(userEmail);
        if (!jwtService.isTokenValid(refreshToken, ud))
            return ResponseEntity.status(401).body(Map.of("error", "Invalid refresh token"));
        String newAccess = jwtService.generateAccessToken(ud);
        return ResponseEntity.ok(Map.of("accessToken", newAccess));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        var userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        var u = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "email", u.getEmail(),
                "name", u.getName(),
                "role", u.getRole(),
                "location", u.getLocation()
        ));
    }

    @PostMapping("/promote-to-admin")
    public ResponseEntity<?> promoteToAdmin(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        
        var userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        
        User user = userOpt.get();
        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(Map.of("message", "User is already admin", "role", user.getRole().name()));
        }
        
        user.setRole(Role.ADMIN);
        userRepository.save(user);
        
        // Generate new token with updated role
        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String newAccessToken = jwtService.generateAccessToken(ud);
        String newRefreshToken = jwtService.generateRefreshToken(ud);
        
        return ResponseEntity.ok(Map.of(
                "message", "User promoted to admin",
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "accessToken", newAccessToken,
                "refreshToken", newRefreshToken
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(name = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenBlacklistService.blacklist(token);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }
}
