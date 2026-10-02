import { request } from '@umijs/max';

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
 * Redirect to the login page after authentication expires, keeping the
 * current location so the user can be sent back after signing in.
 *
 * The JWT itself lives in an HttpOnly cookie managed by the backend, so the
 * frontend never reads or stores it.
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
