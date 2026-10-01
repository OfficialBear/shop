import request from '@/utils/request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface UserInfo {
  id: number;
  username: string;
  name: string;
  token?: string;
  role: string;
  permissions: string[];
}

/**
 * Login.
 *
 * POST /admin/employee/login
 */
export function login(data: LoginParams) {
  return request<UserInfo>('/admin/employee/login', {
    method: 'POST',
    data,
  });
}

/**
 * Logout.
 *
 * POST /admin/employee/logout
 */
export function logout() {
  return request<void>('/admin/employee/logout', {
    method: 'POST',
  });
}

/**
 * Get the current authenticated user.
 *
 * GET /admin/employee/current
 */
export function getCurrentUser() {
  return request<UserInfo>('/admin/employee/current', {
    method: 'GET',
  });
}
