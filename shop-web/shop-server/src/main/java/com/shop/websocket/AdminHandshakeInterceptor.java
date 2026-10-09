package com.shop.websocket;

import com.shop.constant.JwtClaimsConstant;
import com.shop.properties.JwtProperties;
import com.shop.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * WebSocket 握手鉴权：仅接受携带有效管理端 JWT 的连接（Cookie 或 token 查询参数）。
 */
@Component
@Slf4j
public class AdminHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtProperties jwtProperties;

    public AdminHandshakeInterceptor(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {
        String token = resolveToken(request);
        if (!StringUtils.hasText(token)) {
            log.warn("WebSocket 握手被拒：缺少令牌");
            return false;
        }
        try {
            Claims claims = JwtUtil.parseToken(jwtProperties.getAdminSecretKey(), token);
            Long empId = Long.valueOf(claims.get(JwtClaimsConstant.EMP_ID).toString());
            attributes.put("empId", empId);
            attributes.put("username", String.valueOf(claims.get(JwtClaimsConstant.USERNAME)));
            return true;
        } catch (Exception ex) {
            log.warn("WebSocket 握手被拒：令牌校验失败");
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
    }

    private String resolveToken(ServerHttpRequest request) {
        String cookieHeader = request.getHeaders().getFirst(HttpHeaders.COOKIE);
        if (cookieHeader != null) {
            for (String part : cookieHeader.split(";")) {
                String[] kv = part.trim().split("=", 2);
                if (kv.length == 2 && jwtProperties.getAdminTokenName().equals(kv[0])) {
                    return kv[1];
                }
            }
        }
        return UriComponentsBuilder.fromUri(request.getURI()).build()
                .getQueryParams().getFirst("token");
    }
}
