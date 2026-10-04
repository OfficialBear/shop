import { getTurnover } from '@/services/report';
import type { TurnoverReport } from '@/types';
import type { LineConfig } from '@ant-design/plots';
import { Line } from '@ant-design/plots';
import { useRequest } from 'ahooks';
import { Card, Empty, Space, Spin, Statistic } from 'antd';
import React, { useMemo } from 'react';

interface TurnoverTrendCardProps {
  begin: string;
  end: string;
}

interface TurnoverTrendPoint {
  day: string;
  value: number;
}

const formatCurrency = (value: number): string =>
  `¥${Number(value ?? 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * 营业额趋势折线图。随全局时间范围变化自动重新请求。
 */
const TurnoverTrendCard: React.FC<TurnoverTrendCardProps> = ({
  begin,
  end,
}) => {
  const { data, loading } = useRequest(() => getTurnover(begin, end), {
    refreshDeps: [begin, end],
  });

  const list = useMemo<TurnoverReport[]>(() => data ?? [], [data]);

  const { total, dailyAvg, chartData } = useMemo(() => {
    const sum = list.reduce((acc, item) => acc + (item.value ?? 0), 0);
    const points: TurnoverTrendPoint[] = list.map((item) => ({
      day: item.day,
      value: item.value ?? 0,
    }));
    return {
      total: sum,
      dailyAvg: points.length > 0 ? sum / points.length : 0,
      chartData: points,
    };
  }, [list]);

  const config: LineConfig = {
    data: chartData,
    xField: 'day',
    yField: 'value',
    height: 360,
    autoFit: true,
    style: { shape: 'smooth' },
    point: { sizeField: 3 },
    axis: {
      y: {
        labelFormatter: (value: number) => formatCurrency(value),
      },
    },
    tooltip: (datum: TurnoverTrendPoint) => ({
      name: '营业额',
      value: formatCurrency(datum.value),
    }),
  };

  return (
    <Card
      title="营业额趋势"
      extra={
        <Space size={32}>
          <Statistic
            title="区间总营业额"
            value={total}
            precision={2}
            prefix="¥"
          />
          <Statistic
            title="日均营业额"
            value={dailyAvg}
            precision={2}
            prefix="¥"
          />
        </Space>
      }
    >
      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 360,
          }}
        >
          <Spin />
        </div>
      ) : chartData.length === 0 ? (
        <Empty description="暂无数据" style={{ padding: '80px 0' }} />
      ) : (
        <Line {...config} />
      )}
    </Card>
  );
};

export default TurnoverTrendCard;
