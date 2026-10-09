package com.shop.service;

import com.shop.properties.LoginSecurityProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LoginAttemptServiceTest {

    private StringRedisTemplate redisTemplate;
    private ValueOperations<String, String> valueOperations;
    private LoginAttemptService service;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        redisTemplate = mock(StringRedisTemplate.class);
        valueOperations = mock(ValueOperations.class);
        LoginSecurityProperties properties = new LoginSecurityProperties();
        properties.setMaxFailures(2);
        properties.setFailWindow(Duration.ofMinutes(15));
        properties.setLockDuration(Duration.ofMinutes(15));
        service = new LoginAttemptService(redisTemplate, properties);
    }

    @Test
    void locksAccountAfterMaxFailures() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("login:fail:admin")).thenReturn(1L, 2L);

        service.recordFailure("admin");
        service.recordFailure("admin");

        verify(redisTemplate).expire(eq("login:fail:admin"), any(Duration.class));
        verify(valueOperations).set(eq("login:lock:admin"), eq("1"), any(Duration.class));

        when(redisTemplate.getExpire("login:lock:admin")).thenReturn(900L);
        assertThat(service.isLocked("admin")).isTrue();
        assertThat(service.getLockRemainingSeconds("admin")).isEqualTo(900L);
    }

    @Test
    void doesNotLockBeforeThreshold() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("login:fail:admin")).thenReturn(1L);

        service.recordFailure("admin");

        verify(valueOperations, never()).set(anyString(), anyString(), any(Duration.class));
    }

    @Test
    void clearRemovesCounters() {
        service.clear("admin");

        verify(redisTemplate).delete("login:fail:admin");
        verify(redisTemplate).delete("login:lock:admin");
    }

    @Test
    void fallsBackToMemoryWhenRedisUnavailable() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenThrow(new RuntimeException("redis down"));
        when(redisTemplate.getExpire(anyString())).thenThrow(new RuntimeException("redis down"));

        service.recordFailure("admin");
        service.recordFailure("admin");

        assertThat(service.isLocked("admin")).isTrue();
    }
}
