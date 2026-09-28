import { getToken } from './token';

const BASE_URL = 'http://localhost:8080';
const TIMEOUT = 10000;

/**
 * 依赖注入，避免 request 与 auth 互相 import 造成循环依赖：
 *  loginProvider   合并后的登录函数 (…args) => Promise，同一时刻至多一次登录请求
 *  sessionGate     会话就绪门闸 () => Promise，请求发出前等待启动登录完成
 *  onUnauthorized  静默重登失败后的回调，通常跳转登录页
 */
let onUnauthorized = null;
let loginProvider = null;
let sessionGate = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}
export function setLoginProvider(provider) {
  loginProvider = provider;
}
export function setSessionGate(gate) {
  sessionGate = gate;
}

function createError(message, statusCode) {
  const err = new Error(message);
  if (statusCode !== undefined) err.statusCode = statusCode;
  return err;
}

/**
 * 将对象拼接为查询字符串
 * { page: 1, size: 10, tags: ['a','b'] }
 * → page=1&size=10&tags=a&tags=b
 */
function buildQueryString(params) {
  if (!params || typeof params !== 'object') return '';
  const parts = [];
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach(v => {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
      });
    } else if (typeof value === 'object') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`);
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  });
  return parts.join('&');
}

/**
 * 请求拦截：注入 token、header
 */
function requestInterceptor(options) {
  const token = getToken();
  const header = {
    'Content-Type': 'application/json',
    ...(options.header || {})
  };
  if (token) {
    header['token'] = token;
  }
  return { ...options, header };
}

/**
 * 响应拦截：校验 HTTP 状态与业务码，成功返回业务数据，失败抛出带 statusCode 的错误
 */
function responseInterceptor(response) {
  const { statusCode, data } = response;

  if (statusCode === 401) {
    throw createError('未授权', 401);
  }

  if (statusCode < 200 || statusCode >= 300) {
    wx.showToast({ title: `请求错误 ${statusCode}`, icon: 'none' });
    throw createError(`HTTP ${statusCode}`, statusCode);
  }

  // 业务层（约定 code === 1 为成功）
  if (data && data.code === 1) {
    return data.data;
  }

  wx.showToast({ title: (data && data.msg) || '请求失败', icon: 'none' });
  throw createError((data && data.msg) || '业务错误', statusCode);
}

/**
 * 尝试刷新登录态：
 *  - 若并发请求已经换到新 token，直接返回 true，无需再次登录
 *  - 否则调用合并后的登录函数，成功即返回 true
 */
async function tryRefreshToken(tokenAtRequest) {
  const current = getToken();
  if (current && current !== tokenAtRequest) return true;
  if (!loginProvider) return false;
  try {
    await loginProvider();
    return !!getToken();
  } catch (err) {
    console.warn('[request] 静默重新登录失败', err);
    return false;
  }
}

/**
 * 核心请求方法
 * @param {Object}  options
 * @param {string}  options.url              - 接口路径
 * @param {string}  [options.method]         - 请求方法
 * @param {Object}  [options.params]         - 查询参数
 * @param {Object}  [options.data]           - 请求体
 * @param {Object}  [options.header]         - 自定义 header
 * @param {boolean} [options.showLoading]    - 是否显示全局 loading
 * @param {boolean} [options.skipAuthRedirect]- 跳过会话门闸与 401 自动重登（登录接口使用）
 * @param {boolean} [options._retried]       - 内部标记：已重试过一次，防止死循环
 */
async function request(options) {
  const {
    url,
    method = 'GET',
    params,
    data,
    header: customHeader,
    showLoading = true,
    skipAuthRedirect = false,
    _retried = false,
    ...rest
  } = options;

  // 会话门闸：等待启动阶段的登录完成，避免带着空 token 发请求并触发 401
  if (!skipAuthRedirect && sessionGate) {
    try {
      await sessionGate();
    } catch (e) {
      // 门闸失败不阻塞请求，交给后续 401 流程处理
    }
  }

  const tokenAtRequest = getToken();

  let finalUrl = BASE_URL + url;
  const queryString = buildQueryString(params);
  if (queryString) {
    finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString;
  }

  const finalOptions = requestInterceptor({
    url: finalUrl,
    method: method.toUpperCase(),
    data: data || {},
    header: customHeader || {},
    timeout: TIMEOUT,
    ...rest
  });

  if (showLoading) {
    wx.showLoading({ title: '加载中...', mask: true });
  }

  let response;
  try {
    response = await new Promise((resolve, reject) => {
      wx.request({
        ...finalOptions,
        success: resolve,
        fail: (err) => {
          wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
          reject(err);
        }
      });
    });
  } catch (err) {
    if (showLoading) wx.hideLoading();
    throw err;
  }

  // 401：先静默重登并重试一次原请求；失败则交由外部跳转登录
  if (response.statusCode === 401 && !skipAuthRedirect) {
    if (showLoading) wx.hideLoading();

    if (!_retried) {
      const refreshed = await tryRefreshToken(tokenAtRequest);
      if (refreshed) {
        return request({ ...options, _retried: true });
      }
    }
    if (onUnauthorized) onUnauthorized();
    throw createError('未授权', 401);
  }

  if (showLoading) wx.hideLoading();
  return responseInterceptor(response);
}

/**
 * 便捷方法
 */
export const get = (url, params, options = {}) =>
  request({ url, method: 'GET', params, ...options });

export const post = (url, data, options = {}) =>
  request({ url, method: 'POST', data, ...options });

export const put = (url, data, options = {}) =>
  request({ url, method: 'PUT', data, ...options });

export const del = (url, params, options = {}) =>
  request({ url, method: 'DELETE', params, ...options });

export const patch = (url, data, options = {}) =>
  request({ url, method: 'PATCH', data, ...options });

export default {
  request,
  get,
  post,
  put,
  delete: del,
  patch
};
