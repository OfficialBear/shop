import { request } from '@umijs/max';

const TOKEN_STORAGE_KEY = 'token';

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

/**
 * Get JWT from session storage.
 */
export function getToken(): string {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
}

/**
 * Store JWT in session storage.
 */
export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Remove JWT from session storage.
 */
export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Redirect to the login page after authentication expires, keeping the
 * current location so the user can be sent back after signing in.
 */
export function redirectToLogin(): void {
  if (window.location.pathname === '/login') {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const redirect = encodeURIComponent(currentPath);
  window.location.replace(`/login?redirect=${redirect}`);
}

// Re-export Umi's axios instance so the whole app shares one configured client.
export default request;
export { request };
