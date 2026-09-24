import type { Setmeal, SetmealDish, PageParams, PageResult} from '@/types';
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
 * GET /api/admin/setmeal/{id}
 */
export function getSetmealById(id: number) {
  return request<Setmeal>(`/api/admin/setmeal/${id}`, {
    method: 'GET',
  });
}

export function getListByCategoryId(categoryId: number) {
  return request<Setmeal[]>(`/api/admin/setmeal/list`, {
    method: 'GET',
    params: { categoryId },
  });
}

/**
 * Get Setmeales with pagination and filtering.
 *
 * GET /api/admin/setmeal/page?pageNum=1&pageSize=20&keyword=Tom
 */
export function getPage(params: SetmealPageParams) {
  return request<PageResult<Setmeal>>('/api/admin/setmeal/page', {
    method: 'GET',
    params,
  });
}

/**
 * Create a Setmeal.
 *
 * POST /api/admin/setmeal
 */
export function createSetmeal(data: SetmealParams) {
  return request<void>('/api/admin/setmeal', {
    method: 'POST',
    data,
  });
}

/**
 * Update a Setmeal.
 *
 * PUT /api/admin/setmeal
 */
export function updateSetmeal(data: SetmealParams) {
  return request<void>(`/api/admin/setmeal`, {
    method: 'PUT',
    data,
  });
}

/**
 * Update a Setmeal's status.
 *
 * PUT /api/admin/setmeal/status/{status}
 */
export function updateSetmealStatus(status: number, id: number) {
  return request<void>(`/api/admin/setmeal/status/${status}`, {
    method: 'PUT',
    params: { id },
  });
}

/**
 * Delete Setmeals.
 *
 * DELETE /api/admin/setmeal
 */
export function batchDeleteSetmeals(ids: number[]) {
  return request<void>(`/api/admin/setmeal`, {
    method: 'DELETE',
    data: ids,
  });
}
