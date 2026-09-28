import { loginByCode } from './api/user';
import {
  getToken, setToken, getUser, setUser, clearAuth
} from './token.js';

export { getToken, getUser, clearAuth };

/**
 * 判断是否已登录
 */
export function isLoggedIn() {
  return !!getToken();
}

/**
 * 实际的登录动作：wx.login 拿 code → 调后端换 token → 存储
 */
function doLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async (res) => {
        if (!res.code) {
          reject(new Error('wx.login 未返回 code'));
          return;
        }
        try {
          const data = await loginByCode(res.code);
          setToken(data.token);
          if (data.userInfo) setUser(data.userInfo);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      },
      fail: (err) => reject(err)
    });
  });
}

/**
 * 并发登录请求合并：同一时刻只向 /login 发一次请求，
 * 所有调用方共享同一个 Promise，结束后（无论成功失败）释放。
 */
let loginTask = null;
export function wxLogin() {
  if (loginTask) return loginTask;
  loginTask = doLogin().then(
    (data) => {
      loginTask = null;
      return data;
    },
    (err) => {
      loginTask = null;
      throw err;
    }
  );
  return loginTask;
}

/**
 * 会话就绪门闸：应用启动时调用一次。
 * 请求层在发请求前会 await 它，确保启动登录完成后再带 token 请求，
 * 避免启动阶段先发无 token 请求再触发 401。
 */
let bootstrapTask = null;
export function bootstrap() {
  if (isLoggedIn()) return Promise.resolve(true);
  // 复用同一个启动任务：并发请求共享同一次登录，失败也不在门闸上反复重试
  if (bootstrapTask) return bootstrapTask;
  bootstrapTask = wxLogin().then(
    () => true,
    (err) => {
      console.warn('[auth] 启动静默登录失败', err);
      return false;
    }
  );
  return bootstrapTask;
}

/**
 * 登出
 */
export async function wxLogout() {
  clearAuth();
}
