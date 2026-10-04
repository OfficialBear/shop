/**
 * 营业额统计数据
 */
export interface TurnoverReport {
  /**
   * 日期，格式 yyyy-MM-dd
   */
  day: string;

  /**
   * 营业额（元）
   */
  value: number;
}

/**
 * 用户统计数据
 */
export interface UserReport {
  /**
   * 日期，格式 yyyy-MM-dd
   */
  day: string;

  /**
   * 用户数量
   */
  value: number;

  /**
   * 数据类别：new=新增用户，all=总用户
   */
  category: string;
}

/**
 * 商品销量排名
 */
export interface SalesTop10Report {
  /**
   * 商品名称
   */
  name: string;

  /**
   * 销量
   */
  value: number;
}
