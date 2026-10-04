/**
 * 数据统计页时间范围预设
 */
export type RangeKey =
  | 'yesterday'
  | 'last7'
  | 'last30'
  | 'thisWeek'
  | 'thisMonth';

export interface RangeOption {
  label: string;
  value: RangeKey;
}

/**
 * 全局时间选择器选项，顺序即展示顺序
 */
export const RANGE_OPTIONS: RangeOption[] = [
  { label: '昨日', value: 'yesterday' },
  { label: '近7日', value: 'last7' },
  { label: '近30日', value: 'last30' },
  { label: '本周', value: 'thisWeek' },
  { label: '本月', value: 'thisMonth' },
];

/**
 * 默认选中的时间范围
 */
export const DEFAULT_RANGE_KEY: RangeKey = 'last7';
