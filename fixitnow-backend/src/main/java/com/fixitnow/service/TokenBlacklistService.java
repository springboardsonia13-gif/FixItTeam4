package com.fixitnow.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory blacklist for JWT tokens. Suitable for dev/demo.
 */
@Service
public class TokenBlacklistService {

    private final Map<String, Instant> blacklistedTokens = new ConcurrentHashMap<>();

    public void blacklist(String token) {
        if (token == null || token.isBlank()) return;
        blacklistedTokens.put(token, Instant.now());
    }

    public boolean isBlacklisted(String token) {
        return token != null && blacklistedTokens.containsKey(token);
    }
}
