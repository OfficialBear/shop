package com.shop.exception;

public class HttpClientException extends RuntimeException {

    private final String requestUrl;

    private final Integer statusCode;

    private final String responseBody;

    public HttpClientException(
            String message,
            String requestUrl
    ) {
        this(message, requestUrl, null, null, null);
    }

    public HttpClientException(
            String message,
            String requestUrl,
            Throwable cause
    ) {
        this(message, requestUrl, null, null, cause);
    }

    public HttpClientException(
            String message,
            String requestUrl,
            Integer statusCode,
            String responseBody
    ) {
        this(message, requestUrl, statusCode, responseBody, null);
    }

    public HttpClientException(
            String message,
            String requestUrl,
            Integer statusCode,
            String responseBody,
            Throwable cause
    ) {
        super(message, cause);
        this.requestUrl = requestUrl;
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }

    public String getRequestUrl() {
        return requestUrl;
    }

    public Integer getStatusCode() {
        return statusCode;
    }

    public String getResponseBody() {
        return responseBody;
    }
}
