import { Card, Empty, Spin } from 'antd';
import React from 'react';

interface ChartCardProps {
  title: string;
  loading: boolean;
  empty: boolean;
  extra?: React.ReactNode;
  height?: number;
  children: React.ReactNode;
}

/**
 * 图表卡片外壳：统一标题、loading、空态与固定高度，消除各卡片的模板重复。
 */
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  loading,
  empty,
  extra,
  height = 360,
  children,
}) => (
  <Card title={title} extra={extra}>
    {loading ? (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height,
        }}
      >
        <Spin />
      </div>
    ) : empty ? (
      <Empty description="暂无数据" style={{ padding: '80px 0' }} />
    ) : (
      children
    )}
  </Card>
);

export default ChartCard;
