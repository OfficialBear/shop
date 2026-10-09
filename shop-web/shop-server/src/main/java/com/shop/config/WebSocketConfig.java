package com.shop.config;

import com.shop.websocket.AdminHandshakeInterceptor;
import com.shop.websocket.WebSocketServer;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket 配置：注册 /ws 处理端点，并挂载握手鉴权拦截器。
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final WebSocketServer webSocketServer;
    private final AdminHandshakeInterceptor adminHandshakeInterceptor;

    public WebSocketConfig(WebSocketServer webSocketServer,
                           AdminHandshakeInterceptor adminHandshakeInterceptor) {
        this.webSocketServer = webSocketServer;
        this.adminHandshakeInterceptor = adminHandshakeInterceptor;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketServer, "/ws")
                .addInterceptors(adminHandshakeInterceptor)
                .setAllowedOriginPatterns("*");
    }
}
