import { BellOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import {
  Badge,
  Button,
  Empty,
  List,
  Popover,
  Space,
  Tag,
  Typography,
} from 'antd';
import React from 'react';

const TYPE_META: Record<number, { text: string; color: string }> = {
  1: { text: '来单', color: 'blue' },
  2: { text: '催单', color: 'orange' },
};

const formatTime = (time: number): string =>
  new Date(time).toLocaleTimeString('zh-CN', { hour12: false });

/**
 * 顶部「通知中心」：铃铛 + 未读徽标，点开查看最近订单提醒。
 * 点击某条可跳到订单管理页并打开该订单详情。
 */
const OrderAlertBell: React.FC = () => {
  const { alerts, unread, markAllRead, clear } = useModel('orderAlert');

  const content = (
    <div style={{ width: 320 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Typography.Text strong>最近提醒</Typography.Text>
        <Space size={4}>
          <Button
            type="link"
            size="small"
            disabled={unread === 0}
            onClick={markAllRead}
          >
            全部已读
          </Button>
          <Button
            type="link"
            size="small"
            disabled={alerts.length === 0}
            onClick={clear}
          >
            清空
          </Button>
        </Space>
      </div>

      {alerts.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无提醒" />
      ) : (
        <List
          size="small"
          dataSource={alerts}
          style={{ maxHeight: 320, overflowY: 'auto' }}
          renderItem={(item) => {
            const meta = TYPE_META[item.type] ?? {
              text: '提醒',
              color: 'default',
            };
            return (
              <List.Item
                style={{ cursor: 'pointer' }}
                onClick={() => history.push(`/order?orderId=${item.orderId}`)}
              >
                <List.Item.Meta
                  title={
                    <Space size={6}>
                      <Tag color={meta.color}>{meta.text}</Tag>
                      <span>{item.content}</span>
                    </Space>
                  }
                  description={formatTime(item.time)}
                />
              </List.Item>
            );
          }}
        />
      )}

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <Button type="link" size="small" onClick={() => history.push('/order')}>
          查看全部订单
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      onOpenChange={(open) => {
        if (open) {
          markAllRead();
        }
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: 48,
          padding: '0 8px',
          cursor: 'pointer',
        }}
      >
        <Badge count={unread} size="small" overflowCount={99}>
          <BellOutlined style={{ fontSize: 16 }} />
        </Badge>
      </span>
    </Popover>
  );
};

export default OrderAlertBell;
