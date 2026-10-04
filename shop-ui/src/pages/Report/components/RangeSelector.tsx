import { Segmented, Space, Typography } from 'antd';
import React from 'react';
import type { RangeKey } from '../constants';
import { RANGE_OPTIONS } from '../constants';
import type { DateRange } from '../utils/dateRange';

interface RangeSelectorProps {
  value: RangeKey;
  range: DateRange;
  onChange: (value: RangeKey) => void;
}

/**
 * 全局时间选择器，其选中的范围作用于页面内所有图表。
 */
const RangeSelector: React.FC<RangeSelectorProps> = ({
  value,
  range,
  onChange,
}) => (
  <Space size={16} wrap>
    <Segmented
      value={value}
      options={RANGE_OPTIONS}
      onChange={(next) => onChange(next as RangeKey)}
    />
    <Typography.Text type="secondary">
      统计区间：{range.begin} ~ {range.end}
    </Typography.Text>
  </Space>
);

export default RangeSelector;
