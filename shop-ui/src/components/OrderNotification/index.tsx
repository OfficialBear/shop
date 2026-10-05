import { useOrderSocket } from '@/hooks/useOrderSocket';
import {
  loadOrderSounds,
  playNewOrderSound,
  playReminderSound,
  unlockOrderSounds,
} from '@/utils/orderSound';
import { useModel } from '@umijs/max';
import { notification } from 'antd';
import { useEffect, useRef } from 'react';

const MSG_NEW_ORDER = 1;
const MSG_REMINDER = 2;

/**
 * 来单提醒 / 客户催单。
 * 登录后建立 WebSocket，收到消息时写入通知中心、播放语音并弹轻提示。
 * 逻辑已拆到 useOrderSocket（连接）与 orderSound（提示音），本组件只做编排。
 */
const OrderNotification: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const userId = initialState?.currentUser?.userId;

  const { addAlert } = useModel('orderAlert');
  const addAlertRef = useRef(addAlert);
  addAlertRef.current = addAlert;

  // 预加载提示音，并在任意首次手势内解锁自动播放
  useEffect(() => {
    if (!userId) {
      return;
    }
    loadOrderSounds();
    const unlock = () => unlockOrderSounds();
    document.addEventListener('click', unlock, true);
    document.addEventListener('touchstart', unlock, true);
    document.addEventListener('keydown', unlock, true);
    return () => {
      document.removeEventListener('click', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    };
  }, [userId]);

  useOrderSocket(userId, (message) => {
    if (message.type !== MSG_NEW_ORDER && message.type !== MSG_REMINDER) {
      return;
    }
    addAlertRef.current({
      orderId: message.orderId,
      type: message.type,
      content: message.content,
      time: Date.now(),
    });

    if (message.type === MSG_NEW_ORDER) {
      playNewOrderSound();
    } else {
      playReminderSound();
    }

    // 轻提示：固定 key，自动消失，不堆叠
    notification.open({
      key: 'order-alert',
      type: 'warning',
      message: message.type === MSG_NEW_ORDER ? '来单提醒' : '客户催单',
      description: message.content,
      duration: 4.5,
    });
  });

  return null;
};

export default OrderNotification;
