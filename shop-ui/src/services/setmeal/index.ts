import type { PageParams, PageResult, Setmeal, SetmealDish } from '@/types';
import request from '@/utils/request';

export interface SetmealPageParams extends PageParams {
  name?: string;
  categoryId?: number;
  status?: number;
}

export interface SetmealParams {
  id?: number;
  name?: string; // 套餐名称
  categoryId?: number;
  price?: number; // 套餐价格
  image?: string; // 图片
  description?: string; // 描述信息
  status?: number; // 状态 0:停用 1:启用
  setmealDishes?: SetmealDish[]; // 套餐和菜品的关联关系
}

/**
 * Get a Setmeal by ID.
 *
 * GET /admin/setmeal/{id}
 */
export function getSetmealById(id: number) {
  return request<Setmeal>(`/admin/setmeal/${id}`, {
    method: 'GET',
  });
}

export function getListByCategoryId(categoryId: number) {
  return request<Setmeal[]>('/admin/setmeal/list', {
    method: 'GET',
    params: { categoryId },
  });
}

/**
 * Get Setmeals with pagination and filtering.
 *
 * GET /admin/setmeal/page?pageNum=1&pageSize=20&keyword=Tom
 */
export function getPage(params: SetmealPageParams) {
  return request<PageResult<Setmeal>>('/admin/setmeal/page', {
    method: 'GET',
    params,
  });
}

/**
 * Create a Setmeal.
 *
 * POST /admin/setmeal
 */
export function createSetmeal(data: SetmealParams) {
  return request<void>('/admin/setmeal', {
    method: 'POST',
    data,
  });
}

/**
 * Update a Setmeal.
 *
 * PUT /admin/setmeal
 */
export function updateSetmeal(data: SetmealParams) {
  return request<void>('/admin/setmeal', {
    method: 'PUT',
    data,
  });
}

/**
 * Update a Setmeal's status.
 *
 * PUT /admin/setmeal/status/{status}
 */
export function updateSetmealStatus(status: number, id: number) {
  return request<void>(`/admin/setmeal/status/${status}`, {
    method: 'PUT',
    params: { id },
  });
}

/**
 * Delete Setmeals.
 *
 * DELETE /admin/setmeal
 */
export function batchDeleteSetmeals(ids: number[]) {
  return request<void>('/admin/setmeal', {
    method: 'DELETE',
    data: ids,
  });
}
