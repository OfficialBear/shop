import type { Order, PageParams, PageResult } from '@/types';
import request from '@/utils/request';

export interface OrderPageParams extends PageParams {
  /** 订单号（模糊） */
  number?: string;
  /** 订单状态 */
  status?: number;
  /** 下单时间起（yyyy-MM-dd） */
  beginTime?: string;
  /** 下单时间止（yyyy-MM-dd） */
  endTime?: string;
}

/**
 * 订单分页查询（管理端）
 *
 * GET /admin/order/page
 */
export function getOrderPage(params: OrderPageParams) {
  return request<PageResult<Order>>('/admin/order/page', {
    method: 'GET',
    params,
  });
}

/**
 * 订单详情（管理端）
 *
 * GET /admin/order/detail/{id}
 */
export function getOrderDetail(id: number) {
  return request<Order>(`/admin/order/detail/${id}`, {
    method: 'GET',
  });
}
