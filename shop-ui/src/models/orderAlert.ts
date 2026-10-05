import { useCallback, useState } from 'react';

/**
 * 来单/催单提醒项（用于通知中心）。
 */
export interface OrderAlertItem {
  orderId: number;
  /** 1=来单，2=催单 */
  type: number;
  content: string;
  /** 时间戳（毫秒） */
  time: number;
}

const MAX_ALERTS = 50;

/**
 * 全局订单提醒模型：WebSocket 收到消息时写入，顶部铃铛读取。
 * 通过 `useModel('orderAlert')` 使用。
 */
const useOrderAlert = () => {
  const [alerts, setAlerts] = useState<OrderAlertItem[]>([]);
  const [unread, setUnread] = useState(0);

  const addAlert = useCallback((alert: OrderAlertItem) => {
    setAlerts((prev) => {
      const next = [alert, ...prev];
      return next.length > MAX_ALERTS ? next.slice(0, MAX_ALERTS) : next;
    });
    setUnread((count) => count + 1);
  }, []);

  const markAllRead = useCallback(() => setUnread(0), []);

  const clear = useCallback(() => {
    setAlerts([]);
    setUnread(0);
  }, []);

  return { alerts, unread, addAlert, markAllRead, clear };
};

export default useOrderAlert;
