package com.shop.utils;

import com.shop.exception.HttpClientException;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.classic.methods.HttpUriRequestBase;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.ParseException;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.StringJoiner;

public final class HttpClientUtil {

    private static final int CONNECT_TIMEOUT_SECONDS = 5;
    private static final int RESPONSE_TIMEOUT_SECONDS = 10;

    private static final CloseableHttpClient HTTP_CLIENT = createHttpClient();

    private HttpClientUtil() {
    }

    private static CloseableHttpClient createHttpClient() {
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(
                        CONNECT_TIMEOUT_SECONDS,
                        java.util.concurrent.TimeUnit.SECONDS
                )
                .setResponseTimeout(
                        RESPONSE_TIMEOUT_SECONDS,
                        java.util.concurrent.TimeUnit.SECONDS
                )
                .build();

        return HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .build();
    }

    public static String get(String url) {
        return get(url, null, null);
    }

    public static String get(
            String url,
            Map<String, String> headers,
            Map<String, String> queryParams
    ) {
        String requestUrl = buildUrl(url, queryParams);

        HttpGet request = new HttpGet(requestUrl);
        setHeaders(request, headers);

        return execute(request);
    }

    public static String post(
            String url,
            String body
    ) {
        return post(url, null, body);
    }

    public static String post(
            String url,
            Map<String, String> headers,
            String body
    ) {
        HttpPost request = new HttpPost(url);

        setHeaders(request, headers);

        if (body != null) {
            request.setEntity(
                    new StringEntity(
                            body,
                            ContentType.APPLICATION_JSON
                    )
            );
        }

        return execute(request);
    }

    private static String execute(HttpUriRequestBase request) {
        try (CloseableHttpResponse response = HTTP_CLIENT.execute(request)) {
            int statusCode = response.getCode();

            HttpEntity entity = response.getEntity();
            String responseBody = entity == null
                    ? ""
                    : EntityUtils.toString(entity, StandardCharsets.UTF_8);

            if (statusCode < 200 || statusCode >= 300) {
                throw new HttpClientException(
                        "HTTP request failed, statusCode="
                                + statusCode
                                + ", response="
                                + responseBody
                );
            }

            return responseBody;
        } catch (IOException | ParseException ex) {
            throw new HttpClientException(
                    "HTTP request failed, url=" + request.getRequestUri(),
                    ex
            );
        }
    }

    private static void setHeaders(
            HttpUriRequestBase request,
            Map<String, String> headers
    ) {
        if (headers == null || headers.isEmpty()) {
            return;
        }

        headers.forEach((name, value) -> {
            if (name != null && value != null) {
                request.setHeader(name, value);
            }
        });
    }

    private static String buildUrl(
            String url,
            Map<String, String> queryParams
    ) {
        if (queryParams == null || queryParams.isEmpty()) {
            return url;
        }

        StringJoiner query = new StringJoiner("&");

        queryParams.forEach((key, value) -> {
            if (key != null && value != null) {
                query.add(
                        URLEncoder.encode(key, StandardCharsets.UTF_8)
                                + "="
                                + URLEncoder.encode(value, StandardCharsets.UTF_8)
                );
            }
        });

        if (query.length() == 0) {
            return url;
        }

        return url + (url.contains("?") ? "&" : "?") + query;
    }

    public static void close() {
        try {
            HTTP_CLIENT.close();
        } catch (IOException e) {
            throw new HttpClientException(
                    "Failed to close HTTP client",
                    e
            );
        }
    }
}
