package com.shop.service;

import com.shop.properties.LoginSecurityProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 登录失败计数与账号临时锁定。
 * 以 Redis 为主存储（多实例一致）；Redis 不可用时降级为单机内存计数，避免直接放行。
 */
@Service
@Slf4j
public class LoginAttemptService {

    private static final String FAIL_KEY_PREFIX = "login:fail:";
    private static final String LOCK_KEY_PREFIX = "login:lock:";
    private static final int FALLBACK_MAX_ENTRIES = 10_000;

    private final StringRedisTemplate redisTemplate;
    private final LoginSecurityProperties properties;
    private final Map<String, LocalAttempt> fallbackStore = new ConcurrentHashMap<>();

    public LoginAttemptService(StringRedisTemplate redisTemplate,
                               LoginSecurityProperties properties) {
        this.redisTemplate = redisTemplate;
        this.properties = properties;
    }

    /**
     * 返回剩余锁定秒数（未锁定返回 0）。
     */
    public long getLockRemainingSeconds(String username) {
        try {
            Long ttl = redisTemplate.getExpire(lockKey(username));
            return ttl == null || ttl < 0 ? 0 : ttl;
        } catch (RuntimeException ex) {
            log.warn("Redis 不可用，登录锁定查询降级内存: {}", ex.getMessage());
            return fallbackRemainingSeconds(username);
        }
    }

    public boolean isLocked(String username) {
        return getLockRemainingSeconds(username) > 0;
    }

    /**
     * 记录一次登录失败；达到阈值则锁定账号。
     */
    public void recordFailure(String username) {
        try {
            String failKey = failKey(username);
            Long count = redisTemplate.opsForValue().increment(failKey);
            if (count != null && count == 1L) {
                redisTemplate.expire(failKey, properties.getFailWindow());
            }
            if (count != null && count >= properties.getMaxFailures()) {
                redisTemplate.opsForValue().set(lockKey(username), "1", properties.getLockDuration());
                redisTemplate.delete(failKey);
            }
        } catch (RuntimeException ex) {
            log.warn("Redis 不可用，登录失败计数降级内存: {}", ex.getMessage());
            fallbackRecordFailure(username);
        }
    }

    /**
     * 登录成功后清除计数与锁定。
     */
    public void clear(String username) {
        try {
            redisTemplate.delete(failKey(username));
            redisTemplate.delete(lockKey(username));
        } catch (RuntimeException ex) {
            log.warn("Redis 不可用，登录计数清理降级内存: {}", ex.getMessage());
            fallbackStore.remove(username);
        }
    }

    private long fallbackRemainingSeconds(String username) {
        LocalAttempt attempt = fallbackStore.get(username);
        if (attempt == null) {
            return 0;
        }
        long remainingMs = attempt.lockUntil - System.currentTimeMillis();
        return remainingMs > 0 ? remainingMs / 1000 : 0;
    }

    private void fallbackRecordFailure(String username) {
        if (fallbackStore.size() >= FALLBACK_MAX_ENTRIES) {
            fallbackStore.clear();
        }
        long now = System.currentTimeMillis();
        fallbackStore.compute(username, (key, previous) -> {
            LocalAttempt attempt = previous;
            if (attempt == null || attempt.failExpireAt <= now) {
                attempt = new LocalAttempt();
            }
            attempt.count++;
            attempt.failExpireAt = now + properties.getFailWindow().toMillis();
            if (attempt.count >= properties.getMaxFailures()) {
                attempt.lockUntil = now + properties.getLockDuration().toMillis();
                attempt.count = 0;
            }
            return attempt;
        });
    }

    private String failKey(String username) {
        return FAIL_KEY_PREFIX + username;
    }

    private String lockKey(String username) {
        return LOCK_KEY_PREFIX + username;
    }

    private static final class LocalAttempt {
        private int count;
        private long failExpireAt;
        private long lockUntil;
    }
}
