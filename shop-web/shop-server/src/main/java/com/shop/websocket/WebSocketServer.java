package com.shop.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 管理端 WebSocket 服务：来单提醒 / 客户催单。
 * 会话仅在握手通过鉴权（AdminHandshakeInterceptor）后才会建立并登记。
 */
@Component
@Slf4j
public class WebSocketServer extends TextWebSocketHandler {

    /** 单实例最大并发连接数，防止连接耗尽 */
    private static final int MAX_CONNECTIONS = 200;

    /** 已认证会话登记表：sessionId -> session（并发安全） */
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        if (sessions.size() >= MAX_CONNECTIONS) {
            log.warn("WebSocket 连接数已达上限 {}，拒绝会话 {}", MAX_CONNECTIONS, session.getId());
            closeQuietly(session, CloseStatus.SERVICE_OVERLOAD);
            return;
        }
        sessions.put(session.getId(), session);
        log.info("WebSocket 已连接: {}，当前连接数: {}", session.getId(), sessions.size());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();
        log.info("收到会话 {} 的消息，长度 {}", session.getId(), payload == null ? 0 : payload.length());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session.getId());
        log.info("WebSocket 断开: {}，当前连接数: {}", session.getId(), sessions.size());
    }

    /**
     * 广播给全部已认证会话（管理端来单提醒 / 催单）。
     */
    public void sendToAllClient(String message) {
        sessions.values().forEach(session -> send(session, message));
    }

    /**
     * 定向推送：仅发送给指定会话。
     */
    public void sendToClient(String sessionId, String message) {
        WebSocketSession session = sessions.get(sessionId);
        if (session != null) {
            send(session, message);
        }
    }

    private void send(WebSocketSession session, String message) {
        if (!session.isOpen()) {
            sessions.remove(session.getId());
            return;
        }
        try {
            // WebSocketSession 非线程安全，发送时串行化，避免并发写同一连接
            synchronized (session) {
                session.sendMessage(new TextMessage(message));
            }
        } catch (IOException ex) {
            log.error("WebSocket 消息发送失败: {}", session.getId(), ex);
            closeQuietly(session, CloseStatus.SERVER_ERROR);
            sessions.remove(session.getId());
        }
    }

    private void closeQuietly(WebSocketSession session, CloseStatus status) {
        try {
            session.close(status);
        } catch (IOException ex) {
            log.debug("关闭 WebSocket 会话失败: {}", session.getId(), ex);
        }
    }
}
