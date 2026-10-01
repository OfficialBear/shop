import type { PageParams, PageResult, User } from '@/types';
import request from '@/utils/request';

export interface UserPageParams extends PageParams {
  username?: string;
  phone?: string;
  name?: string;
  sex?: string;
  status?: number;
}

export interface UserParams {
  id?: number;
  username?: string;
  name?: string;
  phone?: string;
  sex?: number;
  idNumber?: string;
}

/**
 * Get an employee by ID.
 *
 * GET /admin/employee/{id}
 */
export function getUserById(id: number) {
  return request<User>(`/admin/employee/${id}`, {
    method: 'GET',
  });
}

/**
 * Get employees with pagination and filtering.
 *
 * GET /admin/employee/page?pageNum=1&pageSize=20&keyword=Tom
 */
export function getPage(params: UserPageParams) {
  return request<PageResult<User>>('/admin/employee/page', {
    method: 'GET',
    params,
  });
}

/**
 * Create an employee.
 *
 * POST /admin/employee
 */
export function createUser(data: UserParams) {
  return request<void>('/admin/employee', {
    method: 'POST',
    data,
  });
}

/**
 * Update an employee.
 *
 * PUT /admin/employee
 */
export function updateUser(data: UserParams) {
  return request<void>('/admin/employee', {
    method: 'PUT',
    data,
  });
}

/**
 * Update an employee's status.
 *
 * PUT /admin/employee/status/{status}
 */
export function updateUserStatus(status: number, id: number) {
  return request<void>(`/admin/employee/status/${status}`, {
    method: 'PUT',
    params: { id },
  });
}

/**
 * Batch delete employees.
 *
 * DELETE /admin/employee
 */
export function batchDeleteUsers(ids: number[]) {
  return request<void>('/admin/employee', {
    method: 'DELETE',
    data: ids,
  });
}
