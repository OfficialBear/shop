import type { Category, PageParams, PageResult } from '@/types';
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
 * GET /admin/category/list
 */
export function getListByType(type: number) {
  return request<Category[]>('/admin/category/list', {
    method: 'GET',
    params: { type },
  });
}

/**
 * Get Categories with pagination and filtering.
 *
 * GET /admin/category/page?pageNum=1&pageSize=20&keyword=Tom
 */
export function getPage(params: CategoryPageParams) {
  return request<PageResult<Category>>('/admin/category/page', {
    method: 'GET',
    params,
  });
}

/**
 * Create a Category.
 *
 * POST /admin/category
 */
export function createCategory(data: CategoryParams) {
  return request<void>('/admin/category', {
    method: 'POST',
    data,
  });
}

/**
 * Update a Category.
 *
 * PUT /admin/category
 */
export function updateCategory(data: CategoryParams) {
  return request<void>('/admin/category', {
    method: 'PUT',
    data,
  });
}

/**
 * Update a Category's status.
 *
 * PUT /admin/category/status/{status}
 */
export function updateCategoryStatus(status: number, id: number) {
  return request<void>(`/admin/category/status/${status}`, {
    method: 'PUT',
    params: { id },
  });
}

/**
 * Delete a Category.
 *
 * DELETE /admin/category
 */
export function deleteCategory(id: number) {
  return request<void>('/admin/category', {
    method: 'DELETE',
    params: { id },
  });
}
