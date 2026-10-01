import type { Dish, DishFlavor, PageParams, PageResult } from '@/types';
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
 * GET /admin/dish/{id}
 */
export function getDishById(id: number) {
  return request<Dish>(`/admin/dish/${id}`, {
    method: 'GET',
  });
}

export function getListByCategoryId(categoryId?: number) {
  return request<Dish[]>('/admin/dish/list', {
    method: 'GET',
    params: { categoryId },
  });
}

/**
 * Get dishes with pagination and filtering.
 *
 * GET /admin/dish/page?pageNum=1&pageSize=20&keyword=Tom
 */
export function getPage(params: DishPageParams) {
  return request<PageResult<Dish>>('/admin/dish/page', {
    method: 'GET',
    params,
  });
}

/**
 * Create a dish.
 *
 * POST /admin/dish
 */
export function createDish(data: DishParams) {
  return request<void>('/admin/dish', {
    method: 'POST',
    data,
  });
}

/**
 * Update a dish.
 *
 * PUT /admin/dish
 */
export function updateDish(data: DishParams) {
  return request<void>('/admin/dish', {
    method: 'PUT',
    data,
  });
}

/**
 * Update a dish's status.
 *
 * PUT /admin/dish/status/{status}
 */
export function updateDishStatus(status: number, id: number) {
  return request<void>(`/admin/dish/status/${status}`, {
    method: 'PUT',
    params: { id },
  });
}

/**
 * Delete dishes.
 *
 * DELETE /admin/dish
 */
export function batchDeleteDishes(ids: number[]) {
  return request<void>('/admin/dish', {
    method: 'DELETE',
    data: ids,
  });
}
