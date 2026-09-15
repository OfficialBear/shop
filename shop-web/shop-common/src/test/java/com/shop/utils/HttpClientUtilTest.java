package com.shop.utils;

import com.shop.exception.HttpClientException;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.classic.methods.HttpUriRequestBase;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.Header;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class HttpClientUtilTest {

    private CloseableHttpClient httpClient;

    private HttpClientUtil httpClientUtil;

    @BeforeEach
    void setUp() {
        httpClient = mock(CloseableHttpClient.class);
        httpClientUtil = new HttpClientUtil(httpClient);
    }

    @Test
    void shouldSendGetRequest() throws Exception {
        CloseableHttpResponse response = mock(CloseableHttpResponse.class);

        when(response.getCode()).thenReturn(200);
        when(response.getEntity()).thenReturn(null);
        when(httpClient.execute(any(HttpUriRequestBase.class)))
                .thenReturn(response);

        String url = "http://localhost:8080/api/users";

        String result = httpClientUtil.get(url);

        assertThat(result).isEmpty();

        ArgumentCaptor<HttpUriRequestBase> captor =
                ArgumentCaptor.forClass(HttpUriRequestBase.class);

        verify(httpClient).execute(captor.capture());

        HttpUriRequestBase request = captor.getValue();

        assertThat(request)
                .isInstanceOf(HttpGet.class);

        assertThat(request.getUri().toString())
                .isEqualTo(url);
    }

    @Test
    void shouldSendGetRequestWithQueryParameters() throws Exception {
        CloseableHttpResponse response = mock(CloseableHttpResponse.class);

        when(response.getCode()).thenReturn(200);
        when(response.getEntity()).thenReturn(null);
        when(httpClient.execute(any(HttpUriRequestBase.class)))
                .thenReturn(response);

        String url = "http://localhost:8080/api/users";

        Map<String, String> queryParams = Map.of(
                "page", "1",
                "size", "20",
                "keyword", "John Doe"
        );

        httpClientUtil.get(
                url,
                null,
                queryParams
        );

        ArgumentCaptor<HttpUriRequestBase> captor =
                ArgumentCaptor.forClass(HttpUriRequestBase.class);

        verify(httpClient).execute(captor.capture());

        HttpGet request = (HttpGet) captor.getValue();

        String requestUrl = request.getUri().toString();

        assertThat(requestUrl)
                .contains("page=1");

        assertThat(requestUrl)
                .contains("size=20");

        assertThat(requestUrl)
                .contains("keyword=John%20Doe");
    }

    @Test
    void shouldAppendQueryParametersToExistingQueryString()
            throws Exception {

        CloseableHttpResponse response = mock(CloseableHttpResponse.class);

        when(response.getCode()).thenReturn(200);
        when(response.getEntity()).thenReturn(null);
        when(httpClient.execute(any(HttpUriRequestBase.class)))
                .thenReturn(response);

        String url =
                "http://localhost:8080/api/users?status=active";

        Map<String, String> queryParams = Map.of(
                "page", "1",
                "size", "20"
        );

        httpClientUtil.get(
                url,
                null,
                queryParams
        );

        ArgumentCaptor<HttpUriRequestBase> captor =
                ArgumentCaptor.forClass(HttpUriRequestBase.class);

        verify(httpClient).execute(captor.capture());

        HttpGet request = (HttpGet) captor.getValue();

        String requestUrl = request.getUri().toString();

        assertThat(requestUrl)
                .contains("status=active");

        assertThat(requestUrl)
                .contains("page=1");

        assertThat(requestUrl)
                .contains("size=20");
    }

    @Test
    void shouldSendGetRequestWithHeaders() throws Exception {
        CloseableHttpResponse response = mock(CloseableHttpResponse.class);

        when(response.getCode()).thenReturn(200);
        when(response.getEntity()).thenReturn(null);
        when(httpClient.execute(any(HttpUriRequestBase.class)))
                .thenReturn(response);

        String url = "http://localhost:8080/api/users";

        Map<String, String> headers = Map.of(
                "Authorization", "Bearer test-token",
                "X-Request-Id", "request-123"
        );

        httpClientUtil.get(
                url,
                headers
        );

        ArgumentCaptor<HttpUriRequestBase> captor =
                ArgumentCaptor.forClass(HttpUriRequestBase.class);

        verify(httpClient).execute(captor.capture());

        HttpGet request = (HttpGet) captor.getValue();

        assertThat(request.getFirstHeader("Authorization"))
                .isNotNull();

        assertThat(request.getFirstHeader("Authorization").getValue())
                .isEqualTo("Bearer test-token");

        assertThat(request.getFirstHeader("X-Request-Id"))
                .isNotNull();

        assertThat(request.getFirstHeader("X-Request-Id").getValue())
                .isEqualTo("request-123");
    }

    @Test
    void shouldSendPostJsonRequest() throws Exception {
        CloseableHttpResponse response = mock(CloseableHttpResponse.class);

        when(response.getCode()).thenReturn(200);
        when(response.getEntity()).thenReturn(null);
        when(httpClient.execute(any(HttpUriRequestBase.class)))
                .thenReturn(response);

        String url = "http://localhost:8080/api/users";

        String body = """
                {"name":"Tom","age":18}
                """;

        String result = httpClientUtil.post(url, body);

        assertThat(result).isEmpty();

        ArgumentCaptor<HttpUriRequestBase> captor =
                ArgumentCaptor.forClass(HttpUriRequestBase.class);

        verify(httpClient).execute(captor.capture());

        HttpPost post = (HttpPost) captor.getValue();

        assertThat(post.getUri().toString())
                .isEqualTo(url);

        HttpEntity entity = post.getEntity();

        assertThat(entity)
                .isNotNull();

        assertThat(entity.getContentType())
                .contains("application/json");
        assertThat(entity.getContentType())
                .containsIgnoringCase("charset=UTF-8");

        String actualBody = EntityUtils.toString(
                entity,
                StandardCharsets.UTF_8
        );

        assertThat(actualBody)
                .isEqualTo(body);
    }

    @Test
    void shouldSendPostJsonRequestWithHeadersAndQueryParameters()
            throws Exception {

        CloseableHttpResponse response = mock(CloseableHttpResponse.class);

        when(response.getCode()).thenReturn(200);
        when(response.getEntity()).thenReturn(null);
        when(httpClient.execute(any(HttpUriRequestBase.class)))
                .thenReturn(response);

        String url = "http://localhost:8080/api/users";

        Map<String, String> headers = Map.of(
                "Authorization", "Bearer test-token",
                "X-Request-Id", "request-123"
        );

        Map<String, String> queryParams = Map.of(
                "source", "admin",
                "notify", "true"
        );

        String body = """
                {"name":"Tom","age":18}
                """;

        httpClientUtil.post(
                url,
                headers,
                queryParams,
                body
        );

        ArgumentCaptor<HttpUriRequestBase> captor =
                ArgumentCaptor.forClass(HttpUriRequestBase.class);

        verify(httpClient).execute(captor.capture());

        HttpPost post = (HttpPost) captor.getValue();

        assertThat(post.getUri().toString())
                .contains("source=admin");

        assertThat(post.getUri().toString())
                .contains("notify=true");

        Header authorization =
                post.getFirstHeader("Authorization");

        assertThat(authorization)
                .isNotNull();

        assertThat(authorization.getValue())
                .isEqualTo("Bearer test-token");

        Header requestId =
                post.getFirstHeader("X-Request-Id");

        assertThat(requestId)
                .isNotNull();

        assertThat(requestId.getValue())
                .isEqualTo("request-123");

        assertThat(post.getEntity())
                .isNotNull();

        String actualBody = EntityUtils.toString(
                post.getEntity(),
                StandardCharsets.UTF_8
        );

        assertThat(actualBody)
                .isEqualTo(body);
    }

    @Test
    void shouldReturnResponseBody() throws Exception {
        CloseableHttpResponse response = mock(CloseableHttpResponse.class);

        String responseBody = """
                {"id":1,"name":"Tom"}
                """;

        HttpEntity responseEntity = new StringEntity(
                responseBody,
                ContentType.APPLICATION_JSON
        );

        when(response.getCode()).thenReturn(200);
        when(response.getEntity()).thenReturn(responseEntity);

        when(httpClient.execute(any(HttpUriRequestBase.class)))
                .thenReturn(response);

        String result = httpClientUtil.get(
                "http://localhost:8080/api/users/1"
        );

        assertThat(result)
                .isEqualTo(responseBody);
    }

    @Test
    void shouldReturnEmptyStringWhenResponseHasNoEntity()
            throws Exception {

        CloseableHttpResponse response = mock(CloseableHttpResponse.class);

        when(response.getCode()).thenReturn(204);
        when(response.getEntity()).thenReturn(null);

        when(httpClient.execute(any(HttpUriRequestBase.class)))
                .thenReturn(response);

        String result = httpClientUtil.get(
                "http://localhost:8080/api/users/1"
        );

        assertThat(result)
                .isEmpty();
    }

    @Test
    void shouldThrowExceptionWhenResponseStatusIsNotSuccessful()
            throws Exception {

        CloseableHttpResponse response = mock(CloseableHttpResponse.class);

        when(response.getCode()).thenReturn(500);
        when(response.getEntity()).thenReturn(null);

        when(httpClient.execute(any(HttpUriRequestBase.class)))
                .thenReturn(response);

        String url = "http://localhost:8080/api/users";

        assertThatThrownBy(() -> httpClientUtil.get(url))
                .isInstanceOf(HttpClientException.class)
                .satisfies(exception -> {
                    HttpClientException ex =
                            (HttpClientException) exception;

                    assertThat(ex.getRequestUrl())
                            .isEqualTo(url);

                    assertThat(ex.getStatusCode())
                            .isEqualTo(500);

                    assertThat(ex.getResponseBody())
                            .isEmpty();
                });
    }

    @Test
    void shouldIncludeResponseBodyWhenResponseStatusIsNotSuccessful()
            throws Exception {

        CloseableHttpResponse response = mock(CloseableHttpResponse.class);

        String responseBody = """
                {"code":"INVALID_PARAMETER"}
                """;

        HttpEntity responseEntity = new StringEntity(
                responseBody,
                ContentType.APPLICATION_JSON
        );

        when(response.getCode()).thenReturn(400);
        when(response.getEntity()).thenReturn(responseEntity);

        when(httpClient.execute(any(HttpUriRequestBase.class)))
                .thenReturn(response);

        String url = "http://localhost:8080/api/users";

        assertThatThrownBy(() -> httpClientUtil.get(url))
                .isInstanceOf(HttpClientException.class)
                .satisfies(exception -> {
                    HttpClientException ex =
                            (HttpClientException) exception;

                    assertThat(ex.getRequestUrl())
                            .isEqualTo(url);

                    assertThat(ex.getStatusCode())
                            .isEqualTo(400);

                    assertThat(ex.getResponseBody())
                            .isEqualTo(responseBody);
                });
    }

    @Test
    void shouldWrapIOException() throws Exception {
        CloseableHttpClient httpClient =
                mock(CloseableHttpClient.class);

        IOException cause =
                new IOException("Connection refused");

        doThrow(cause)
                .when(httpClient)
                .execute(any(HttpUriRequestBase.class));

        HttpClientUtil util =
                new HttpClientUtil(httpClient);

        String url = "http://localhost:8080/api/users";

        assertThatThrownBy(() -> util.get(url))
                .isInstanceOf(HttpClientException.class)
                .satisfies(exception -> {
                    HttpClientException ex =
                            (HttpClientException) exception;

                    assertThat(ex.getRequestUrl())
                            .isEqualTo(url);

                    assertThat(ex.getStatusCode())
                            .isNull();

                    assertThat(ex.getResponseBody())
                            .isNull();

                    assertThat(ex.getCause())
                            .isSameAs(cause);
                });
    }

    @Test
    void shouldCloseResponseAfterSuccessfulRequest()
            throws Exception {

        CloseableHttpResponse response =
                mock(CloseableHttpResponse.class);

        when(response.getCode()).thenReturn(200);
        when(response.getEntity()).thenReturn(null);

        when(httpClient.execute(any(HttpUriRequestBase.class)))
                .thenReturn(response);

        httpClientUtil.get(
                "http://localhost:8080/api/users"
        );

        verify(response).close();
    }

    @Test
    void shouldCloseResponseAfterFailedRequest()
            throws Exception {

        CloseableHttpResponse response =
                mock(CloseableHttpResponse.class);

        when(response.getCode()).thenReturn(500);
        when(response.getEntity()).thenReturn(null);

        when(httpClient.execute(any(HttpUriRequestBase.class)))
                .thenReturn(response);

        assertThatThrownBy(() ->
                httpClientUtil.get(
                        "http://localhost:8080/api/users"
                )
        ).isInstanceOf(HttpClientException.class);

        verify(response).close();
    }

    @Test
    void shouldRejectBlankUrl() {
        assertThatThrownBy(() ->
                httpClientUtil.get(" ")
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("URL must not be blank");
    }

    @Test
    void shouldRejectNullUrl() {
        assertThatThrownBy(() ->
                httpClientUtil.get(null)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("URL must not be blank");
    }
}