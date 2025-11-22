package com.fixitnow.config;

import com.fixitnow.model.User;
import com.fixitnow.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    private final UserRepository userRepo;

    public CurrentUser(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    public User get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserDetails)) {
            return null;
        }
        UserDetails details = (UserDetails) auth.getPrincipal();
        return userRepo.findByEmail(details.getUsername()).orElse(null);
    }

    public Long getId() {
        User user = get();
        return user != null ? user.getId() : null;
    }

    public boolean hasRole(String role) {
        User user = get();
        return user != null && user.getRole() != null && user.getRole().name().equals(role);
    }
}