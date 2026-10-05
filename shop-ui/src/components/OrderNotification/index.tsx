import { BellOutlined, SoundOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button, notification } from 'antd';
import { useEffect, useRef, useState } from 'react';

/**
 * 后端 WebSocket 推送的消息体。
 * type: 1=来单提醒，2=客户催单
 */
interface OrderMessage {
  type: number;
  orderId: number;
  content: string;
}

const MSG_NEW_ORDER = 1;
const MSG_REMINDER = 2;
const RECONNECT_DELAY = 3000;
// 声音节流：突发多单时最多每 2 秒响一次，避免噪音
const SOUND_THROTTLE = 2000;

// utoopack 不支持打包 mp3 模块，音频由 public/ 静态提供（构建时原样拷贝到产物根目录）
const NEW_ORDER_SOUND = '/audio/new-order.mp3';
const REMINDER_SOUND = '/audio/reminder.mp3';

/**
 * 来单提醒 / 客户催单。
 *
 * 登录后（布局内）建立 WebSocket 连接，收到后端推送时播放对应语音并弹出通知。
 *
 * 音频加载说明：Umi/utoopack 的 dev server 不支持 `Range` 请求，而 `<audio>`（尤其
 * Safari）会用 Range 拉取媒体，导致回退到 index.html → NotSupportedError。因此这里
 * 先用 fetch 取成 Blob，再用 objectURL 交给 Audio，绕开 Range 问题（生产同样可用）。
 */
const OrderNotification: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const userId = initialState?.currentUser?.userId;

  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(true);
  soundOnRef.current = soundOn;

  const unlockRef = useRef<(audible: boolean) => void>(() => {});

  // 写入通知中心（顶部铃铛读取），并对声音做节流
  const { addAlert } = useModel('orderAlert');
  const addAlertRef = useRef(addAlert);
  addAlertRef.current = addAlert;
  const lastSoundAtRef = useRef(0);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const ctx = {
      audios: [] as HTMLAudioElement[],
      objectUrls: [] as string[],
      token: 0,
      ready: false,
      gestureSeen: false,
      pendingAudible: false,
      disposed: false,
    };

    const playElement = (
      audio: HTMLAudioElement,
      muted: boolean,
      pauseAfterStart: boolean,
      myToken: number,
    ) => {
      const prevMuted = audio.muted;
      audio.muted = muted;
      try {
        audio.currentTime = 0;
      } catch {
        // 元数据未就绪时忽略
      }

      let played: Promise<void> | undefined;
      try {
        played = audio.play();
      } catch (error) {
        console.warn('[OrderNotification] 音频播放异常:', error);
        audio.muted = prevMuted;
        return;
      }
      if (!played || typeof played.then !== 'function') {
        return;
      }
      played
        .then(() => {
          // 仅“静音解锁”在启动后暂停；且必须没有更新的播放（令牌一致）才暂停
          if (pauseAfterStart && ctx.token === myToken) {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = prevMuted;
          }
        })
        .catch((error) => {
          console.warn('[OrderNotification] 音频播放被拒绝:', error);
          audio.muted = prevMuted;
        });
    };

    function removeGestureListeners() {
      document.removeEventListener('click', onGesture, true);
      document.removeEventListener('keydown', onGesture, true);
      document.removeEventListener('touchstart', onGesture, true);
    }

    function onGesture() {
      unlock(false);
    }

    /**
     * 解锁音频自动播放（必须在用户手势回调内调用）。
     * audible=true：用真实音量试听「来单」音；false：静音播放两个元素后暂停。
     */
    function unlock(audible: boolean) {
      if (!ctx.ready) {
        ctx.gestureSeen = true;
        if (audible) {
          ctx.pendingAudible = true;
        }
        return;
      }
      ctx.token += 1;
      const myToken = ctx.token;
      if (audible && ctx.audios[0]) {
        playElement(ctx.audios[0], false, false, myToken);
      } else {
        ctx.audios.forEach((audio) => playElement(audio, true, true, myToken));
      }
      removeGestureListeners();
    }

    unlockRef.current = unlock;
    document.addEventListener('click', onGesture, true);
    document.addEventListener('keydown', onGesture, true);
    document.addEventListener('touchstart', onGesture, true);

    const load = async () => {
      const entries = [NEW_ORDER_SOUND, REMINDER_SOUND];
      const loaded = await Promise.all(
        entries.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            ctx.objectUrls.push(objectUrl);
            return new Audio(objectUrl);
          } catch (error) {
            console.warn('[OrderNotification] 音频加载失败:', url, error);
            return null;
          }
        }),
      );
      if (ctx.disposed) {
        return;
      }
      ctx.audios = loaded.filter(
        (audio): audio is HTMLAudioElement => audio !== null,
      );
      ctx.audios.forEach((audio) => {
        audio.preload = 'auto';
      });
      ctx.ready = true;
      if (ctx.pendingAudible) {
        ctx.pendingAudible = false;
        unlock(true);
      } else if (ctx.gestureSeen) {
        unlock(false);
      }
    };
    load();

    const handleMessage = (raw: string) => {
      let data: OrderMessage;
      try {
        data = JSON.parse(raw) as OrderMessage;
      } catch {
        return;
      }
      if (data.type !== MSG_NEW_ORDER && data.type !== MSG_REMINDER) {
        return;
      }

      // 写入通知中心；不再逐单弹常驻框，避免爆单时右上角刷屏
      addAlertRef.current({
        orderId: data.orderId,
        type: data.type,
        content: data.content,
        time: Date.now(),
      });

      // 声音节流：突发多单只响一声
      const now = Date.now();
      if (
        soundOnRef.current &&
        now - lastSoundAtRef.current >= SOUND_THROTTLE
      ) {
        lastSoundAtRef.current = now;
        const audio =
          data.type === MSG_NEW_ORDER ? ctx.audios[0] : ctx.audios[1];
        if (audio) {
          ctx.token += 1;
          playElement(audio, false, false, ctx.token);
        }
      }

      // 轻提示：固定 key，自动消失，永不堆叠
      notification.open({
        key: 'order-alert',
        type: 'warning',
        message: data.type === MSG_NEW_ORDER ? '来单提醒' : '客户催单',
        description: data.content,
        duration: 4.5,
      });
    };

    let closed = false;
    let reconnectTimer: number | undefined;
    let socket: WebSocket | undefined;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const sid = `admin-${userId}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      socket = new WebSocket(`${protocol}://${window.location.host}/ws/${sid}`);

      socket.onmessage = (event) => handleMessage(event.data);

      socket.onclose = () => {
        if (closed) {
          return;
        }
        reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      ctx.disposed = true;
      closed = true;
      removeGestureListeners();
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
      socket = undefined;
      ctx.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [userId]);

  if (!userId) {
    return null;
  }

  return (
    <Button
      type={soundOn ? 'primary' : 'default'}
      shape="round"
      icon={soundOn ? <SoundOutlined /> : <BellOutlined />}
      onClick={() => {
        const next = !soundOn;
        setSoundOn(next);
        if (next) {
          // 打开时在点击手势内真实音量试听一次，完成解锁
          unlockRef.current(true);
        }
      }}
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      {soundOn ? '来单语音：开' : '来单语音：关'}
    </Button>
  );
};

export default OrderNotification;
