// 运行时配置

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate

import OrderAlertBell from '@/components/OrderAlertBell';
import OrderNotification from '@/components/OrderNotification';
import UnAccessible from '@/components/UnAccessible';
import { CurrentUser, getCurrentUser } from '@/services/auth';
import type { Result } from '@/types';
import { ApiError, redirectToLogin } from '@/utils/request';
import type {
  AxiosError,
  AxiosResponse,
  ErrorInterceptor,
  RequestConfig,
  ResponseInterceptor,
} from '@umijs/max';
import { message } from 'antd';
import React from 'react';

const SUCCESS_CODE = 1;

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数有误',
  401: '登录已过期，请重新登录',
  403: '没有权限访问',
  404: '请求的资源不存在',
  405: '请求方法不被允许',
  408: '请求超时',
  409: '资源冲突',
  422: '参数校验失败',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
};

function resolveErrorMessage(error: Error, status?: number): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (status) {
    return HTTP_ERROR_MESSAGES[status] ?? `请求失败 (${status})`;
  }
  return error.message || '请求失败';
}

// 解包业务 Result，并对业务错误抛出 ApiError
const unwrapResponse = ((response: AxiosResponse<Result<unknown>>) => {
  const res = response.data;
  if (res && typeof res.code === 'number' && res.code !== SUCCESS_CODE) {
    throw new ApiError(res.msg || '请求失败', res.code);
  }
  if (res && typeof res === 'object' && 'data' in res) {
    response.data = res.data as Result<unknown>;
  }
  return response;
}) as unknown as ResponseInterceptor;

// HTTP 层错误：401 跳转登录页（令牌在 HttpOnly Cookie 中，前端无需清理）
const handleHttpError = ((error: Error) => {
  const axiosError = error as AxiosError;
  if (axiosError.response?.status === 401) {
    redirectToLogin();
  }
  return Promise.reject(error);
}) as unknown as ErrorInterceptor;

export async function getInitialState(): Promise<{
  currentUser?: CurrentUser;
}> {
  try {
    const currentUser = await getCurrentUser();
    return { currentUser };
  } catch {
    return {};
  }
}

export const layout = () => {
  return {
    logo: undefined,
    menu: {
      locale: false,
    },
    siderWidth: 180,
    // 未登录/无权限访问受保护路由时，重定向到登录页
    unAccessible: React.createElement(UnAccessible),
    // 登录后（布局内）挂载 WebSocket 来单提醒 / 客户催单
    childrenRender: (children: React.ReactNode) =>
      React.createElement(
        React.Fragment,
        null,
        children,
        React.createElement(OrderNotification),
      ),
    // 顶部右侧：通知中心（铃铛 + 未读徽标）
    rightContentRender: (_layoutProps: unknown, dom?: React.ReactNode) =>
      React.createElement(
        React.Fragment,
        null,
        React.createElement(OrderAlertBell),
        dom,
      ),
  };
};

/**
 * 全局请求配置：统一 baseURL、业务码解包、HTTP 错误与 401 处理。
 * 管理员令牌由后端写入 HttpOnly Cookie，浏览器自动携带，前端不存储令牌。
 */
export const request: RequestConfig = {
  baseURL: '/api',
  timeout: 10000,
  // 跨域部署时也要携带 Cookie（同源部署下无副作用）
  withCredentials: true,
  responseInterceptors: [[unwrapResponse, handleHttpError]],
  errorConfig: {
    errorHandler: (error, opts) => {
      if (opts?.skipErrorHandler) {
        return;
      }
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      // 401 已由响应拦截器跳转登录，这里不再重复提示
      if (status === 401) {
        return;
      }
      message.error(resolveErrorMessage(error, status));
    },
  },
};
