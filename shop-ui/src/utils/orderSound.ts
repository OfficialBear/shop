/**
 * 来单/催单提示音（模块级单例，供通知组件与铃铛开关共享）。
 *
 * 说明：Umi/utoopack 的 dev server 不支持 Range 请求，而 <audio> 会用 Range 拉取媒体，
 * 会回退到 index.html 导致 NotSupportedError。因此先用 fetch 取成 Blob，再用 objectURL 播放。
 */

const NEW_ORDER_SOUND = '/audio/new-order.mp3';
const REMINDER_SOUND = '/audio/reminder.mp3';
// 声音节流：突发多单时最多每 2 秒响一次
const SOUND_THROTTLE_MS = 2000;

let newOrderAudio: HTMLAudioElement | undefined;
let reminderAudio: HTMLAudioElement | undefined;
let loaded = false;
let loading = false;
let enabled = true;
let pendingUnlock = false;
let lastPlayAt = 0;

async function createAudio(url: string): Promise<HTMLAudioElement | undefined> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    audio.preload = 'auto';
    return audio;
  } catch (error) {
    console.warn('[orderSound] 音频加载失败:', url, error);
    return undefined;
  }
}

/** 预加载提示音（幂等） */
export async function loadOrderSounds(): Promise<void> {
  if (loaded || loading) {
    return;
  }
  loading = true;
  try {
    const [a, b] = await Promise.all([
      createAudio(NEW_ORDER_SOUND),
      createAudio(REMINDER_SOUND),
    ]);
    newOrderAudio = a;
    reminderAudio = b;
    loaded = true;
    if (pendingUnlock) {
      pendingUnlock = false;
      unlockOrderSounds();
    }
  } finally {
    loading = false;
  }
}

/** 在用户手势内静音播放一次以解锁自动播放（Safari 等严格策略） */
export function unlockOrderSounds(): void {
  if (!loaded) {
    pendingUnlock = true;
    return;
  }
  [newOrderAudio, reminderAudio].forEach((audio) => {
    if (!audio) {
      return;
    }
    const prevMuted = audio.muted;
    audio.muted = true;
    try {
      audio.currentTime = 0;
    } catch {
      // 忽略
    }
    const played = audio.play();
    if (played && typeof played.then === 'function') {
      played
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = prevMuted;
        })
        .catch(() => {
          audio.muted = prevMuted;
        });
    }
  });
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  if (value) {
    // 开启本身就是一次手势，顺便解锁
    unlockOrderSounds();
  }
}

export function isSoundEnabled(): boolean {
  return enabled;
}

function play(audio?: HTMLAudioElement): void {
  if (!audio) {
    return;
  }
  try {
    audio.muted = false;
    audio.currentTime = 0;
    const played = audio.play();
    if (played && typeof played.catch === 'function') {
      played.catch(() => undefined);
    }
  } catch {
    // 忽略
  }
}

export function playNewOrderSound(): void {
  if (!enabled || Date.now() - lastPlayAt < SOUND_THROTTLE_MS) {
    return;
  }
  lastPlayAt = Date.now();
  play(newOrderAudio);
}

export function playReminderSound(): void {
  if (!enabled || Date.now() - lastPlayAt < SOUND_THROTTLE_MS) {
    return;
  }
  lastPlayAt = Date.now();
  play(reminderAudio);
}
