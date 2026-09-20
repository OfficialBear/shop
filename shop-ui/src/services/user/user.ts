import request from '@/utils/request';
import type { Result, PageParams, PageResult, User } from '@/types';

export interface UserPageParams extends PageParams{
  username?: string;
  phone?: string;
  name?: string;
  sex?: string;
  status?: number;
}

export interface CreateUserParams {
  id?: number;
  username: string;
  name: string;
  phone: string;
  sex: number;
  idNumber: string;
}

export interface UpdateUserParams {
  id: number;
  username?: string;
  name?: string;
  phone?: string;
  sex?: number;
  idNumber?: string;
}

/**
 * Get a user by ID.
 *
 * GET /api/users/{id}
 */
export function getUserById(id: number) {
  return request<User>(`/api/admin/employee/${id}`, {
    method: 'GET',
  });
}

/**
 * Get users with pagination and filtering.
 *
 * GET /api/admin/employee/page?pageNum=1&pageSize=20&keyword=Tom
 */
export function getUserList(params: UserPageParams) {
  return request<PageResult<User>>('/api/admin/employee/page', {
    method: 'GET',
    params,
  });
}

/**
 * Create a user.
 *
 * POST /api/admin/employee
 */
export function createUser(data: CreateUserParams) {
  return request<Result>('/api/admin/employee', {
    method: 'POST',
    data,
  });
}

/**
 * Update a user.
 *
 * PUT /api/admin/employee
 */
export function updateUser(data: UpdateUserParams) {
  return request<Result>(`/api/admin/employee`, {
    method: 'PUT',
    data,
  });
}

/**
 * Update a user's status.
 *
 * PUT /api/admin/employee/status/{status}
 */
export function updateUserStatus(status: number, id: number) {
  return request<Result>(`/api/admin/employee/status/${status}`, {
    method: 'PUT',
    params: { id },
  });
}

/**
 * Delete a user.
 *
 * DELETE /api/admin/employee
 */
export function deleteUser(ids: (string | number)[]) {
  return request<Result>(`/api/admin/employee`, {
    method: 'DELETE',
    data: ids,
  });
}
