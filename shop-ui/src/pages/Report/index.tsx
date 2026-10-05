import { downloadFile } from '@/utils/download';
import { FileExcelOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Space, message } from 'antd';
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
  const [exporting, setExporting] = useState(false);
  const range = useMemo(() => resolveDateRange(rangeKey), [rangeKey]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadFile('/admin/report/export', {
        params: { begin: range.begin, end: range.end },
        fallbackFileName: `报表_${range.begin}_${range.end}.xlsx`,
      });
      message.success('报表导出成功');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '导出失败');
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageContainer ghost>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <RangeSelector
              value={rangeKey}
              range={range}
              onChange={setRangeKey}
            />
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              loading={exporting}
              onClick={handleExport}
            >
              数据导出
            </Button>
          </div>
        </Card>
        <TurnoverTrendCard begin={range.begin} end={range.end} />
        <UserStatsCard begin={range.begin} end={range.end} />
        <TopSalesRankCard begin={range.begin} end={range.end} />
      </Space>
    </PageContainer>
  );
};

export default ReportPage;
