package com.shop.config;

import com.shop.properties.HttpClientProperties;
import org.apache.hc.client5.http.HttpRoute;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.core5.http.HttpHost;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
        classes = {
                HttpClientConfig.class
        }
)
@TestPropertySource(properties = {
        "http.client.max-total=100",
        "http.client.max-per-route=20",
        "http.client.connect-timeout=2s",
        "http.client.connection-request-timeout=1s",
        "http.client.response-timeout=3s",
        "http.client.socket-timeout=3s",
        "http.client.validate-after-inactivity=5s",
        "http.client.idle-connection-evict-time=10s"
})
class HttpClientConfigTest {

    @Autowired
    private CloseableHttpClient httpClient;

    @Autowired
    private PoolingHttpClientConnectionManager connectionManager;

    @Autowired
    private HttpClientProperties properties;

    @Test
    void shouldCreateHttpClientBean() {
        assertThat(httpClient).isNotNull();
    }

    @Test
    void shouldCreateConnectionPool() {
        assertThat(connectionManager).isNotNull();
    }

    @Test
    void shouldBindHttpClientProperties() {
        assertThat(properties.getMaxTotal())
                .isEqualTo(100);

        assertThat(properties.getMaxPerRoute())
                .isEqualTo(20);

        assertThat(properties.getConnectTimeout())
                .hasSeconds(2);

        assertThat(properties.getConnectionRequestTimeout())
                .hasSeconds(1);

        assertThat(properties.getResponseTimeout())
                .hasSeconds(3);

        assertThat(properties.getIdleConnectionEvictTime())
                .hasSeconds(10);
    }

    @Test
    void shouldConfigureConnectionPool() {
        assertThat(connectionManager.getMaxTotal())
                .isEqualTo(100);

        HttpHost targetHost = new HttpHost(
                "http",
                "localhost",
                8080
        );

        HttpRoute route = new HttpRoute(targetHost);

        assertThat(connectionManager.getMaxPerRoute(route))
                .isEqualTo(20);
    }
}