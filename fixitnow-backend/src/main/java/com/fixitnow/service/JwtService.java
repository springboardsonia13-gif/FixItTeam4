package com.fixitnow.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {

    @Value("${security.jwt.secret}")
    private String jwtSecret;

    @Value("${security.jwt.access-token-expiration-ms}")
    private long accessTokenExpMs;

    @Value("${security.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpMs;

    private Algorithm getAlgorithm() {
        return Algorithm.HMAC256(jwtSecret);
    }

    public String generateAccessToken(UserDetails userDetails) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpMs);
        return JWT.create()
                .withSubject(userDetails.getUsername())
                .withIssuedAt(now)
                .withExpiresAt(expiry)
                .sign(getAlgorithm());
    }

    public String generateRefreshToken(UserDetails userDetails) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenExpMs);
        return JWT.create()
                .withSubject(userDetails.getUsername())
                .withIssuedAt(now)
                .withExpiresAt(expiry)
                .withClaim("typ", "refresh")
                .sign(getAlgorithm());
    }

    public String extractUsername(String token) {
        try {
            DecodedJWT decoded = getVerifier().verify(token);
            return decoded.getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            DecodedJWT decoded = getVerifier().verify(token);
            Date exp = decoded.getExpiresAt();
            return exp.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        if (username == null) return false;
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private JWTVerifier getVerifier() {
        return JWT.require(getAlgorithm()).build();
    }
}