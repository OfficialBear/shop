import type { RangeKey } from '../constants';

export interface DateRange {
  /**
   * 起始日期，格式 yyyy-MM-dd（含）
   */
  begin: string;

  /**
   * 结束日期，格式 yyyy-MM-dd（含）
   */
  end: string;
}

const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * 按本地时区格式化为 yyyy-MM-dd。
 * 不使用 toISOString()，避免时区偏移导致日期错位。
 */
const format = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * 将预设时间范围解析为闭区间 { begin, end }（end 含今天）。
 * 本周以周一为起点（中国习惯）。
 */
export function resolveDateRange(
  key: RangeKey,
  now: Date = new Date(),
): DateRange {
  const today = startOfDay(now);

  switch (key) {
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const day = format(yesterday);
      return { begin: day, end: day };
    }
    case 'last7': {
      const begin = new Date(today);
      begin.setDate(today.getDate() - 6);
      return { begin: format(begin), end: format(today) };
    }
    case 'last30': {
      const begin = new Date(today);
      begin.setDate(today.getDate() - 29);
      return { begin: format(begin), end: format(today) };
    }
    case 'thisWeek': {
      // getDay(): 0=周日 ... 6=周六，转换为周一为起点的偏移
      const offset = (today.getDay() + 6) % 7;
      const begin = new Date(today);
      begin.setDate(today.getDate() - offset);
      return { begin: format(begin), end: format(today) };
    }
    case 'thisMonth':
    default: {
      const begin = new Date(today.getFullYear(), today.getMonth(), 1);
      return { begin: format(begin), end: format(today) };
    }
  }
}
