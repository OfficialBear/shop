package com.shop.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

public class JwtUtil {

    /**
     * Generate a JWT token.
     *
     * @param secretKey  JWT secret key
     * @param claims     custom claims
     * @param expiration token expiration time in milliseconds
     * @return JWT token
     */
    public static String generateToken(
            String secretKey,
            Map<String, Object> claims,
            long expiration
    ) {
        SecretKey key = createKey(secretKey);

        Date now = new Date();
        Date expireAt = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .claims(claims)
                .issuedAt(now)
                .expiration(expireAt)
                .signWith(key)
                .compact();
    }

    /**
     * Parse and validate a JWT token.
     *
     * @param secretKey JWT secret key
     * @param token     JWT token
     * @return JWT claims
     */
    public static Claims parseToken(
            String secretKey,
            String token
    ) {
        SecretKey key = createKey(secretKey);

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Check whether a JWT token is valid.
     *
     * @param secretKey JWT secret key
     * @param token     JWT token
     * @return true if valid
     */
    public static boolean isValid(
            String secretKey,
            String token
    ) {
        try {
            parseToken(secretKey, token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private static SecretKey createKey(String secretKey) {
        return Keys.hmacShaKeyFor(
                secretKey.getBytes(StandardCharsets.UTF_8)
        );
    }
}
