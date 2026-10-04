import { getUserStatistics } from '@/services/report';
import type { UserReport } from '@/types';
import type { DualAxesConfig } from '@ant-design/plots';
import { DualAxes } from '@ant-design/plots';
import { useRequest } from 'ahooks';
import { Card, Empty, Space, Spin, Statistic } from 'antd';
import React, { useMemo } from 'react';

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
 * 用户统计（双 Y 轴折线图）。
 *
 * 总用户数与新增用户量级差异大，故用双 Y 轴：左轴=总用户数，右轴=新增用户数。
 * 随全局时间范围变化自动重新请求。
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
        // all 为截至当日的累计总用户数，取最大值即区间末的总量
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
    // 图例用矩形色块，替代折线默认的线条符号，更直观
    legend: {
      color: {
        itemMarker: 'rect',
        itemMarkerSize: 12,
      },
    },
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
    <Card
      title="用户统计"
      extra={
        <Space size={32}>
          <Statistic title="总用户数" value={totalUsers} />
          <Statistic title="区间新增用户" value={newUsers} />
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
      ) : isEmpty ? (
        <Empty description="暂无数据" style={{ padding: '80px 0' }} />
      ) : (
        <DualAxes {...config} />
      )}
    </Card>
  );
};

export default UserStatsCard;
