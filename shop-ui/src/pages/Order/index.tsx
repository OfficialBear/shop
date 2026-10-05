import {
  getOrderDetail,
  getOrderPage,
  type OrderPageParams,
} from '@/services/order';
import type { Order, OrderItem } from '@/types';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useSearchParams } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Descriptions, Drawer, Image, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useRef, useState } from 'react';

const STATUS_ENUM: Record<string, { text: string }> = {
  '1': { text: '待付款' },
  '2': { text: '待接单' },
  '3': { text: '已接单' },
  '4': { text: '派送中' },
  '5': { text: '已完成' },
  '6': { text: '已取消' },
};

const STATUS_COLOR: Record<number, string> = {
  1: 'default',
  2: 'processing',
  3: 'blue',
  4: 'cyan',
  5: 'success',
  6: 'error',
};

const statusText = (status: number): string =>
  STATUS_ENUM[String(status)]?.text ?? String(status);

const OrderPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [searchParams] = useSearchParams();
  const [detailId, setDetailId] = useState<number | undefined>();

  // 通知中心跳转过来时，自动打开对应订单详情
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      setDetailId(Number(orderId));
    }
  }, [searchParams]);

  const { data: detail, loading: detailLoading } = useRequest(
    () => getOrderDetail(detailId as number),
    { ready: !!detailId, refreshDeps: [detailId] },
  );

  const columns: ProColumns<Order>[] = [
    {
      title: '订单号',
      dataIndex: 'number',
      copyable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: STATUS_ENUM,
      render: (_, record) => (
        <Tag color={STATUS_COLOR[record.status]}>
          {statusText(record.status)}
        </Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      search: false,
      render: (_, record) => `¥ ${record.amount}`,
    },
    {
      title: '桌号',
      dataIndex: 'tableNo',
      search: false,
      render: (_, record) => record.tableNo || '-',
    },
    {
      title: '下单时间',
      dataIndex: 'orderTime',
      search: false,
      render: (_, record) => record.orderTime || '-',
    },
    {
      title: '操作',
      valueType: 'option',
      search: false,
      render: (_, record) => [
        <a key="detail" onClick={() => setDetailId(record.id)}>
          详情
        </a>,
      ],
    },
  ];

  const itemColumns: ColumnsType<OrderItem> = [
    { title: '商品', dataIndex: 'name' },
    {
      title: '图片',
      dataIndex: 'image',
      render: (_, record) =>
        record.image ? <Image width={48} src={record.image} /> : '-',
    },
    { title: '数量', dataIndex: 'number', width: 80 },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 100,
      render: (_, record) => `¥ ${record.amount}`,
    },
    {
      title: '口味',
      dataIndex: 'dishFlavor',
      render: (_, record) => record.dishFlavor || '-',
    },
  ];

  return (
    <PageContainer ghost>
      <ProTable<Order, OrderPageParams>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={{ labelWidth: 'auto' }}
        options={false}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          try {
            const res = await getOrderPage({
              ...(rest as OrderPageParams),
              pageNum: current ?? 1,
              pageSize: pageSize ?? 10,
            });
            return { data: res.records, total: res.total, success: true };
          } catch {
            return { data: [], total: 0, success: false };
          }
        }}
      />

      <Drawer
        title={detail ? `订单详情：${detail.number}` : '订单详情'}
        width={720}
        open={!!detailId}
        onClose={() => setDetailId(undefined)}
        destroyOnClose
      >
        {detail && (
          <>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="状态">
                {statusText(detail.status)}
              </Descriptions.Item>
              <Descriptions.Item label="金额">
                {`¥ ${detail.amount}`}
              </Descriptions.Item>
              <Descriptions.Item label="桌号">
                {detail.tableNo || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="下单时间">
                {detail.orderTime || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="支付方式">
                {detail.payMethod === 1
                  ? '微信'
                  : detail.payMethod === 2
                  ? '支付宝'
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                {detail.remark || '-'}
              </Descriptions.Item>
            </Descriptions>
            <Table<OrderItem>
              rowKey="id"
              size="small"
              loading={detailLoading}
              columns={itemColumns}
              dataSource={detail.items ?? []}
              pagination={false}
            />
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default OrderPage;
