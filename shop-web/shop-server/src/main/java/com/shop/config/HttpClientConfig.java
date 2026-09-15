package com.shop.config;

import com.shop.properties.HttpClientProperties;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.core5.util.TimeValue;
import org.apache.hc.core5.util.Timeout;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
@EnableConfigurationProperties(HttpClientProperties.class)
public class HttpClientConfig {

    @Bean
    public PoolingHttpClientConnectionManager httpClientConnectionManager(
            HttpClientProperties properties
    ) {
        return PoolingHttpClientConnectionManagerBuilder.create()
                .setMaxConnTotal(properties.getMaxTotal())
                .setMaxConnPerRoute(properties.getMaxPerRoute())
                .setValidateAfterInactivity(
                        Timeout.ofMilliseconds(
                                properties.getValidateAfterInactivity().toMillis()
                        )
                )
                .build();
    }

    @Bean(destroyMethod = "close")
    public CloseableHttpClient httpClient(
            PoolingHttpClientConnectionManager connectionManager,
            HttpClientProperties properties
    ) {
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectionRequestTimeout(
                        Timeout.ofMilliseconds(
                                properties.getConnectionRequestTimeout().toMillis()
                        )
                )
                .setConnectTimeout(
                        Timeout.ofMilliseconds(
                                properties.getConnectTimeout().toMillis()
                        )
                )
                .setResponseTimeout(
                        Timeout.ofMilliseconds(
                                properties.getResponseTimeout().toMillis()
                        )
                )
                .build();

        return HttpClients.custom()
                .setConnectionManager(connectionManager)
                .setDefaultRequestConfig(requestConfig)
                .evictExpiredConnections()
                .evictIdleConnections(
                        TimeValue.ofMilliseconds(
                                properties.getIdleConnectionEvictTime().toMillis()
                        )
                )
                .build();
    }
}
