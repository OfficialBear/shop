import request from '@/utils/request';

export interface LoginParams {
  username: string;
  password: string;
}

/**
 * 登录接口返回。
 * 对应后端 EmployeeLoginVO：{ id, userName, name }
 */
export interface LoginResult {
  id: number;
  userName: string;
  name: string;
}

/**
 * 当前登录用户。
 * 对应后端 /admin/employee/current 返回的 LoginUser：{ userId, username, role, permissions }
 */
export interface CurrentUser {
  userId: number;
  username: string;
  role: string | null;
  permissions: string[];
}

/**
 * Login.
 *
 * POST /admin/employee/login
 */
export function login(data: LoginParams) {
  return request<LoginResult>('/admin/employee/login', {
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
  return request<CurrentUser>('/admin/employee/current', {
    method: 'GET',
  });
}
