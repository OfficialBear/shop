// 运行时配置

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate

import { getCurrentUser, UserInfo } from '@/services/auth';
import type { Result } from '@/types';
import UnAccessible from '@/components/UnAccessible';
import {
  ApiError,
  clearToken,
  getToken,
  redirectToLogin,
} from '@/utils/request';
import type {
  AxiosError,
  AxiosResponse,
  ErrorInterceptor,
  RequestConfig,
  RequestInterceptor,
  RequestOptions,
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

// 注入 JWT
const injectToken: RequestInterceptor = (config: RequestOptions) => {
  const token = getToken();
  if (token) {
    config.headers = {
      ...(config.headers ?? {}),
      token,
    } as typeof config.headers;
  }
  return config;
};

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

// HTTP 层错误：401 清理登录态并跳转登录页
const handleHttpError = ((error: Error) => {
  const axiosError = error as AxiosError;
  if (axiosError.response?.status === 401) {
    clearToken();
    redirectToLogin();
  }
  return Promise.reject(error);
}) as unknown as ErrorInterceptor;

export async function getInitialState(): Promise<{ currentUser?: UserInfo }> {
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
  };
};

/**
 * 全局请求配置：统一 baseURL、JWT 注入、业务码解包、HTTP 错误与 401 处理。
 * 业务层只需 `request<T>(url, options)`，无需再关心 token / Result 包装。
 */
export const request: RequestConfig = {
  baseURL: '/api',
  timeout: 10000,
  requestInterceptors: [injectToken],
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
