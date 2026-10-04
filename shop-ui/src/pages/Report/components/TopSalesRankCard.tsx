import { getSalesTop10 } from '@/services/report';
import type { SalesTop10Report } from '@/types';
import type { BarConfig } from '@ant-design/plots';
import { Bar } from '@ant-design/plots';
import { useRequest } from 'ahooks';
import { Card, Empty, Spin } from 'antd';
import React, { useMemo } from 'react';

interface TopSalesRankCardProps {
  begin: string;
  end: string;
}

interface TopSalesPoint {
  name: string;
  value: number;
}

/**
 * 销量排名 Top10（横向条形图，降序）。
 * 随全局时间范围变化自动重新请求。
 */
const TopSalesRankCard: React.FC<TopSalesRankCardProps> = ({ begin, end }) => {
  const { data, loading } = useRequest(() => getSalesTop10(begin, end), {
    refreshDeps: [begin, end],
  });

  const list = useMemo<SalesTop10Report[]>(() => data ?? [], [data]);

  // 保险起见在前端再降序一次，保证第 1 名在顶部
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
    <Card title="销量排名 Top10">
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
        <Bar {...config} />
      )}
    </Card>
  );
};

export default TopSalesRankCard;
