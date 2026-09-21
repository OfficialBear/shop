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
 * POST /api/admin/employee/login
 */
export function login(data: LoginParams) {
  return request<UserInfo>('/api/admin/employee/login', {
    method: 'POST',
    data,
  });
}

/**
 * Logout.
 *
 * POST /api/admin/employee/logout
 */
export function logout() {
  return request<void>('/api/admin/employee/logout', {
    method: 'POST',
  });
}

/**
 * Get the current authenticated user.
 *
 * GET /api/admin/employee/current
 */
export function getCurrentUser() {
  return request<UserInfo>('/api/admin/employee/current', {
    method: 'GET',
  });
}
