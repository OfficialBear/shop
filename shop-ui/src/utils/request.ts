import { request as umiRequest } from '@umijs/max';
import { message } from 'antd';

const SUCCESS_CODE = 1;
const TOKEN_STORAGE_KEY = 'token';

export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export class ApiError extends Error {
  constructor(
    msg: string,
    public readonly code?: number,
    public readonly status?: number,
  ) {
    super(msg);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  showErrorMessage?: boolean;
  [key: string]: unknown;
}

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Resource not found',
  405: 'Method not allowed',
  408: 'Request timeout',
  409: 'Conflict',
  422: 'Validation failed',
  429: 'Too many requests',
  500: 'Internal server error',
  502: 'Bad gateway',
  503: 'Service unavailable',
  504: 'Gateway timeout',
};

/**
 * Get JWT from session storage.
 */
function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Create request headers and inject the JWT token.
 */
function createHeaders(
  headers: HeadersInit | undefined,
  skipAuth: boolean,
): Headers {
  const requestHeaders = new Headers(headers);

  if (!skipAuth) {
    const token = getStoredToken();

    if (token) {
      requestHeaders.set(TOKEN_STORAGE_KEY, `${token}`);
    }
  }

  return requestHeaders;
}
/**
 * Remove JWT from session storage.
 */
export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Store JWT in session storage.
 */
export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Get the current JWT.
 */
export function getToken(): string | null {
  return getStoredToken();
}

/**
 * Redirect to the login page after authentication expires.
 */
function redirectToLogin(): void {
  if (window.location.pathname === '/login') {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const redirect = encodeURIComponent(currentPath);

  window.location.replace(`/login?redirect=${redirect}`);
}

/**
 * Handle HTTP 401 Unauthorized.
 */
function handleUnauthorized(): void {
  clearToken();
  redirectToLogin();
}

export async function request<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    showErrorMessage = true,
    skipAuth = false,
    ...requestOptions
  } = options;

  try {
    const response = await umiRequest<ApiResponse<T>>(url, {
      ...requestOptions,
      errorHandler: (error: any) => {
        const status = error?.response?.status;

        if (status === 401) {
          handleUnauthorized();

          throw new ApiError(
            'Authentication expired. Please sign in again.',
            undefined,
            401,
          );
        }

        if (status) {
          throw new ApiError(
            HTTP_ERROR_MESSAGES[status] ?? 'Request failed',
            undefined,
            status,
          );
        }

        throw error;
      },
    });

    if (response.code !== SUCCESS_CODE) {
      throw new ApiError(response.msg || 'Request failed', response.code);
    }

    return response.data;
  } catch (error) {
    if (showErrorMessage) {
      message.error(error instanceof Error ? error.message : 'Request failed');
    }

    throw error;
  }
}

export default request;
