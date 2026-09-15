package com.shop.utils;

import com.shop.exception.HttpClientException;
import org.apache.hc.client5.http.classic.methods.HttpDelete;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.classic.methods.HttpPut;
import org.apache.hc.client5.http.classic.methods.HttpUriRequestBase;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.ParseException;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.hc.core5.net.URIBuilder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class HttpClientUtil {

    private final CloseableHttpClient httpClient;

    public HttpClientUtil(CloseableHttpClient httpClient) {
        this.httpClient = httpClient;
    }

    public String get(String url) {
        return get(url, null, null);
    }

    public String get(
            String url,
            Map<String, String> headers
    ) {
        return get(url, headers, null);
    }

    public String get(
            String url,
            Map<String, String> headers,
            Map<String, String> queryParams
    ) {
        String requestUrl = buildUrl(url, queryParams);
        HttpGet request = new HttpGet(requestUrl);
        setHeaders(request, headers);
        return execute(request);
    }

    public String post(
            String url,
            String body
    ) {
        return post(url, null, null, body);
    }

    public String post(
            String url,
            Map<String, String> headers,
            String body
    ) {
        return post(url, headers, null, body);
    }

    public String post(
            String url,
            Map<String, String> headers,
            Map<String, String> queryParams,
            String body
    ) {
        String requestUrl = buildUrl(url, queryParams);

        HttpPost request = new HttpPost(requestUrl);

        setHeaders(request, headers);
        setJsonBody(request, body);

        return execute(request);
    }

    public String put(
            String url,
            String body
    ) {
        return put(url, null, null, body);
    }

    public String put(
            String url,
            Map<String, String> headers,
            String body
    ) {
        return put(url, headers, null, body);
    }

    public String put(
            String url,
            Map<String, String> headers,
            Map<String, String> queryParams,
            String body
    ) {
        String requestUrl = buildUrl(url, queryParams);

        HttpPut request = new HttpPut(requestUrl);

        setHeaders(request, headers);
        setJsonBody(request, body);

        return execute(request);
    }

    public String delete(String url) {
        return delete(url, null, null);
    }

    public String delete(
            String url,
            Map<String, String> headers
    ) {
        return delete(url, headers, null);
    }

    public String delete(
            String url,
            Map<String, String> headers,
            Map<String, String> queryParams
    ) {
        String requestUrl = buildUrl(url, queryParams);

        HttpDelete request = new HttpDelete(requestUrl);

        setHeaders(request, headers);

        return execute(request);
    }

    private String execute(HttpUriRequestBase request) {
        final String requestUrl;

        try {
            requestUrl = request.getUri().toString();
        } catch (URISyntaxException ex) {
            throw new HttpClientException(
                    "Invalid request URI",
                    request.getRequestUri(),
                    ex
            );
        }

        try (CloseableHttpResponse response = httpClient.execute(request)) {

            int statusCode = response.getCode();

            String responseBody = readResponseBody(
                    response.getEntity()
            );

            if (!isSuccessful(statusCode)) {
                throw new HttpClientException(
                        "HTTP request failed",
                        requestUrl,
                        statusCode,
                        responseBody
                );
            }

            return responseBody;

        } catch (IOException | ParseException ex) {
            throw new HttpClientException(
                    "HTTP request failed",
                    requestUrl,
                    ex
            );
        }
    }

    private String readResponseBody(HttpEntity entity)
            throws IOException, ParseException {

        if (entity == null) {
            return "";
        }

        return EntityUtils.toString(
                entity,
                StandardCharsets.UTF_8
        );
    }

    private void setJsonBody(
            HttpUriRequestBase request,
            String body
    ) {
        if (body == null) {
            return;
        }

        request.setEntity(
                new StringEntity(
                        body,
                        ContentType.APPLICATION_JSON
                )
        );
    }

    private void setHeaders(
            HttpUriRequestBase request,
            Map<String, String> headers
    ) {
        if (headers == null || headers.isEmpty()) {
            return;
        }

        headers.forEach((name, value) -> {
            if (name != null
                    && !name.isBlank()
                    && value != null) {

                request.setHeader(name, value);
            }
        });
    }

    private String buildUrl(
            String url,
            Map<String, String> queryParams
    ) {
        validateUrl(url);

        if (queryParams == null || queryParams.isEmpty()) {
            return url;
        }

        try {
            URIBuilder uriBuilder = new URIBuilder(url);

            queryParams.forEach((key, value) -> {
                if (key != null
                        && !key.isBlank()
                        && value != null) {

                    uriBuilder.addParameter(key, value);
                }
            });

            return uriBuilder.build().toString();

        } catch (URISyntaxException ex) {
            throw new HttpClientException(
                    "Invalid request URL",
                    url,
                    ex
            );
        }
    }

    private void validateUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException(
                    "URL must not be blank"
            );
        }
    }

    private boolean isSuccessful(int statusCode) {
        return statusCode >= 200 && statusCode < 300;
    }
}