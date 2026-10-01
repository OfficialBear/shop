import { Access } from '@umijs/max';
import { Button, Col, Row, Space } from 'antd';
import React from 'react';

interface TableToolbarProps {
  onCreate: () => void;
  /** 传了才渲染批量删除按钮 */
  onBatchDelete?: () => void;
  /** 批量删除按钮权限 */
  canBatchDelete?: boolean;
}

/**
 * 列表页工具栏：新增 +（可选，带权限的）批量删除。
 */
const TableToolbar: React.FC<TableToolbarProps> = ({
  onCreate,
  onBatchDelete,
  canBatchDelete,
}) => (
  <div>
    <Row gutter={32}>
      <Col span={24}>
        <Space>
          <Button type="primary" onClick={onCreate}>
            新增
          </Button>
          {onBatchDelete ? (
            <Access accessible={!!canBatchDelete}>
              <Button onClick={onBatchDelete}>批量删除</Button>
            </Access>
          ) : null}
        </Space>
      </Col>
    </Row>
  </div>
);

export default TableToolbar;
