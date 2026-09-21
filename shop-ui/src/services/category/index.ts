import type { Category, PageParams, PageResult, Result } from '@/types';
import request from '@/utils/request';

export interface CategoryPageParams extends PageParams {
  name?: string;
  type?: number;
}

export interface CategoryParams {
  id?: number;
  type?: number;
  name?: string;
  sort?: number;
}

/**
 * Get a list by type.
 *
 * GET /api/admin/Category/list
 */
export function getListByType(type: number) {
  return request<Category[]>(`/api/admin/category/list`, {
    method: 'GET',
    params: { type },
  });
}

/**
 * Get Categories with pagination and filtering.
 *
 * GET /api/admin/Category/page?pageNum=1&pageSize=20&keyword=Tom
 */
export function getPage(params: CategoryPageParams) {
  return request<PageResult<Category>>('/api/admin/category/page', {
    method: 'GET',
    params,
  });
}

/**
 * Create a Category.
 *
 * POST /api/admin/Category
 */
export function createCategory(data: CategoryParams) {
  return request<Result>('/api/admin/category', {
    method: 'POST',
    data,
  });
}

/**
 * Update a Category.
 *
 * PUT /api/admin/Category
 */
export function updateCategory(data: CategoryParams) {
  return request<Result>(`/api/admin/category`, {
    method: 'PUT',
    data,
  });
}

/**
 * Update a Category's status.
 *
 * PUT /api/admin/Category/status/{status}
 */
export function updateCategoryStatus(status: number, id: number) {
  return request<Result>(`/api/admin/category/status/${status}`, {
    method: 'PUT',
    params: { id },
  });
}

/**
 * Delete a Category.
 *
 * DELETE /api/admin/Category
 */
export function deleteCategory(id: number) {
  return request<Result>(`/api/admin/category`, {
    method: 'DELETE',
    params: { id },
  });
}
