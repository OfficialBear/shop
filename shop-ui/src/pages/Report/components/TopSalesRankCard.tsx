import { getSalesTop10 } from '@/services/report';
import type { SalesTop10Report } from '@/types';
import type { BarConfig } from '@ant-design/plots';
import { Bar } from '@ant-design/plots';
import { useRequest } from 'ahooks';
import React, { useMemo } from 'react';
import ChartCard from './ChartCard';

interface TopSalesRankCardProps {
  begin: string;
  end: string;
}

interface TopSalesPoint {
  name: string;
  value: number;
}

/**
 * 销量排名 Top10（横向条形图，降序）。随全局时间范围变化自动重新请求。
 */
const TopSalesRankCard: React.FC<TopSalesRankCardProps> = ({ begin, end }) => {
  const { data, loading } = useRequest(() => getSalesTop10(begin, end), {
    refreshDeps: [begin, end],
  });

  const list = useMemo<SalesTop10Report[]>(() => data ?? [], [data]);

  const chartData = useMemo<TopSalesPoint[]>(
    () =>
      list
        .map((item) => ({ name: item.name, value: item.value ?? 0 }))
        .sort((a, b) => b.value - a.value),
    [list],
  );

  const config: BarConfig = {
    data: chartData,
    xField: 'value',
    yField: 'name',
    height: 360,
    autoFit: true,
    label: { text: 'value', position: 'right' },
    axis: {
      x: { title: '销量' },
      y: { title: false },
    },
    tooltip: (datum: TopSalesPoint) => ({
      name: datum.name,
      value: datum.value,
    }),
  };

  return (
    <ChartCard
      title="销量排名 Top10"
      loading={loading}
      empty={chartData.length === 0}
    >
      <Bar {...config} />
    </ChartCard>
  );
};

export default TopSalesRankCard;
