import type { SalesTop10Report, TurnoverReport, UserReport } from '@/types';
import request from '@/utils/request';

/**
 * 营业额统计
 *
 * GET /admin/report/turnoverStatistics?begin=yyyy-MM-dd&end=yyyy-MM-dd
 */
export function getTurnover(begin: string, end: string) {
  return request<TurnoverReport[]>('/admin/report/turnoverStatistics', {
    method: 'GET',
    params: { begin, end },
  });
}

/**
 * 用户统计（新增用户 / 总用户）
 *
 * GET /admin/report/userStatistics?begin=yyyy-MM-dd&end=yyyy-MM-dd
 */
export function getUserStatistics(begin: string, end: string) {
  return request<UserReport[]>('/admin/report/userStatistics', {
    method: 'GET',
    params: { begin, end },
  });
}

/**
 * 销量排名 Top10
 *
 * GET /admin/report/top10?begin=yyyy-MM-dd&end=yyyy-MM-dd
 */
export function getSalesTop10(begin: string, end: string) {
  return request<SalesTop10Report[]>('/admin/report/top10', {
    method: 'GET',
    params: { begin, end },
  });
}
