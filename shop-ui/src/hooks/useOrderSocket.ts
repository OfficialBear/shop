import { useEffect, useRef } from 'react';

export interface OrderMessage {
  /** 1=来单提醒，2=客户催单 */
  type: number;
  orderId: number;
  content: string;
}

const RECONNECT_DELAY = 3000;

/**
 * 后台订单 WebSocket：登录后连接，收到消息回调；断线自动重连。
 */
export function useOrderSocket(
  userId: number | undefined,
  onMessage: (message: OrderMessage) => void,
): void {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!userId) {
      return;
    }
    let closed = false;
    let reconnectTimer: number | undefined;
    let socket: WebSocket | undefined;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      socket = new WebSocket(`${protocol}://${window.location.host}/ws`);

      socket.onmessage = (event) => {
        try {
          onMessageRef.current(JSON.parse(event.data) as OrderMessage);
        } catch {
          // 忽略非法消息
        }
      };
      socket.onclose = () => {
        if (!closed) {
          reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY);
        }
      };
      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
      socket = undefined;
    };
  }, [userId]);
}
