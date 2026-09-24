import type { Dish, DishFlavor, PageParams, PageResult, Result } from '@/types';
import request from '@/utils/request';

export interface DishPageParams extends PageParams {
  name?: string;
  categoryId?: number;
  status?: number;
}

export interface DishParams {
  id?: number;
  name?: string;
  categoryId?: number;
  price?: number;
  image?: string;
  description?: string;
  status?: number;
  flavors?: DishFlavor[];
}

/**
 * Get a dish by ID.
 *
 * GET /api/admin/dish/{id}
 */
export function getDishById(id: number) {
  return request<Dish>(`/api/admin/dish/${id}`, {
    method: 'GET',
  });
}

export function getListByCategoryId(categoryId?: number) {
  return request<Dish[]>(`/api/admin/dish/list`, {
    method: 'GET',
    params: { categoryId },
  });
}

/**
 * Get dishes with pagination and filtering.
 *
 * GET /api/admin/dish/page?pageNum=1&pageSize=20&keyword=Tom
 */
export function getPage(params: DishPageParams) {
  return request<PageResult<Dish>>('/api/admin/dish/page', {
    method: 'GET',
    params,
  });
}

/**
 * Create a dish.
 *
 * POST /api/admin/dish
 */
export function createDish(data: DishParams) {
  return request<void>('/api/admin/dish', {
    method: 'POST',
    data,
  });
}

/**
 * Update a dish.
 *
 * PUT /api/admin/dish
 */
export function updateDish(data: DishParams) {
  return request<void>(`/api/admin/dish`, {
    method: 'PUT',
    data,
  });
}

/**
 * Update a dish's status.
 *
 * PUT /api/admin/dish/status/{status}
 */
export function updateDishStatus(status: number, id: number) {
  return request<void>(`/api/admin/dish/status/${status}`, {
    method: 'PUT',
    params: { id },
  });
}

/**
 * Delete dishes.
 *
 * DELETE /api/admin/dish
 */
export function batchDeleteDishes(ids: number[]) {
  return request<void>(`/api/admin/dish`, {
    method: 'DELETE',
    data: ids,
  });
}
