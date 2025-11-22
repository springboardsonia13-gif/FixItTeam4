package com.fixitnow.controller;

import com.fixitnow.model.User;
import com.fixitnow.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepo;

    public UserController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    /**
     * Get user details by ID (for providers to see customer info)
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepo.findById(id)
            .map(user -> ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "location", user.getLocation() != null ? user.getLocation() : "Not provided",
                "role", user.getRole()
            )))
            .orElse(ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }
}