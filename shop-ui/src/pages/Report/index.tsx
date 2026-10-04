import { PageContainer } from '@ant-design/pro-components';
import { Card, Space } from 'antd';
import React, { useMemo, useState } from 'react';
import RangeSelector from './components/RangeSelector';
import TopSalesRankCard from './components/TopSalesRankCard';
import TurnoverTrendCard from './components/TurnoverTrendCard';
import UserStatsCard from './components/UserStatsCard';
import type { RangeKey } from './constants';
import { DEFAULT_RANGE_KEY } from './constants';
import { resolveDateRange } from './utils/dateRange';

/**
 * 管理端数据统计页。
 *
 * 顶部全局时间选择器的时间范围作用于页面内所有图表；各图表组件接收
 * begin/end 自行请求数据，后续图表可按同样方式接入。
 */
const ReportPage: React.FC = () => {
  const [rangeKey, setRangeKey] = useState<RangeKey>(DEFAULT_RANGE_KEY);
  const range = useMemo(() => resolveDateRange(rangeKey), [rangeKey]);

  return (
    <PageContainer ghost>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card>
          <RangeSelector
            value={rangeKey}
            range={range}
            onChange={setRangeKey}
          />
        </Card>
        <TurnoverTrendCard begin={range.begin} end={range.end} />
        <UserStatsCard begin={range.begin} end={range.end} />
        <TopSalesRankCard begin={range.begin} end={range.end} />
      </Space>
    </PageContainer>
  );
};

export default ReportPage;
