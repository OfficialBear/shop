import { getUserStatistics } from '@/services/report';
import type { UserReport } from '@/types';
import type { DualAxesConfig } from '@ant-design/plots';
import { DualAxes } from '@ant-design/plots';
import { useRequest } from 'ahooks';
import { Space, Statistic } from 'antd';
import React, { useMemo } from 'react';
import ChartCard from './ChartCard';

interface UserStatsCardProps {
  begin: string;
  end: string;
}

interface TotalUserPoint {
  day: string;
  total: number;
}

interface NewUserPoint {
  day: string;
  newUsers: number;
}

/**
 * 用户统计（双 Y 轴折线图）：
 * 总用户数与新增用户量级差异大，故左轴=总用户数、右轴=新增用户数。
 */
const UserStatsCard: React.FC<UserStatsCardProps> = ({ begin, end }) => {
  const { data, loading } = useRequest(() => getUserStatistics(begin, end), {
    refreshDeps: [begin, end],
  });

  const list = useMemo<UserReport[]>(() => data ?? [], [data]);

  const { totalUsers, newUsers, totalData, newData } = useMemo(() => {
    let total = 0;
    let added = 0;
    const totals: TotalUserPoint[] = [];
    const news: NewUserPoint[] = [];

    list.forEach((item) => {
      const value = item.value ?? 0;
      if (item.category === 'all') {
        total = Math.max(total, value);
        totals.push({ day: item.day, total: value });
      } else if (item.category === 'new') {
        added += value;
        news.push({ day: item.day, newUsers: value });
      }
    });

    return {
      totalUsers: total,
      newUsers: added,
      totalData: totals,
      newData: news,
    };
  }, [list]);

  const config: DualAxesConfig = {
    height: 360,
    autoFit: true,
    xField: 'day',
    legend: true,
    children: [
      {
        data: totalData,
        type: 'line',
        yField: 'total',
        colorField: () => '总用户',
        style: { shape: 'smooth', lineWidth: 2 },
        axis: { y: { position: 'left', title: '总用户数' } },
        tooltip: (datum: TotalUserPoint) => ({
          name: '总用户',
          value: datum.total,
        }),
      },
      {
        data: newData,
        type: 'line',
        yField: 'newUsers',
        colorField: () => '新增用户',
        style: { shape: 'smooth', lineWidth: 2 },
        axis: { y: { position: 'right', title: '新增用户' } },
        tooltip: (datum: NewUserPoint) => ({
          name: '新增用户',
          value: datum.newUsers,
        }),
      },
    ],
  };

  const isEmpty = totalData.length === 0 && newData.length === 0;

  return (
    <ChartCard
      title="用户统计"
      loading={loading}
      empty={isEmpty}
      extra={
        <Space size={32}>
          <Statistic title="总用户数" value={totalUsers} />
          <Statistic title="区间新增用户" value={newUsers} />
        </Space>
      }
    >
      <DualAxes {...config} />
    </ChartCard>
  );
};

export default UserStatsCard;
