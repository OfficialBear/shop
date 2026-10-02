package com.shop.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@Getter
@Setter
@ConfigurationProperties(prefix = "http.client")
public class HttpClientProperties {

    private int maxTotal = 200;

    private int maxPerRoute = 50;

    private Duration connectTimeout = Duration.ofSeconds(5);

    private Duration connectionRequestTimeout = Duration.ofSeconds(3);

    private Duration responseTimeout = Duration.ofSeconds(10);

    private Duration socketTimeout = Duration.ofSeconds(10);

    private Duration validateAfterInactivity = Duration.ofSeconds(5);

    private Duration idleConnectionEvictTime = Duration.ofSeconds(30);
}
