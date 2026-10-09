package com.shop.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * 登录防爆破相关配置。
 */
@Component
@ConfigurationProperties(prefix = "security.login")
@Data
public class LoginSecurityProperties {

    /** 连续失败多少次后锁定账号 */
    private int maxFailures = 5;

    /** 失败计数的时间窗口（窗口内累计） */
    private Duration failWindow = Duration.ofMinutes(15);

    /** 触发后的锁定时长 */
    private Duration lockDuration = Duration.ofMinutes(15);
}
