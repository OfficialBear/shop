import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import { Button, Form, Space } from 'antd';
import React from 'react';
import './index.less';

interface SearchPanelProps<S> {
  form: FormInstance<S>;
  onSearch: (values: S) => void;
  onReset: () => void;
  children: React.ReactNode;
}

/**
 * 列表页搜索面板外壳：统一的卡片样式与「查询 / 重置」操作。
 * 页面只需把若干 Form.Item 作为 children 传入。
 */
function SearchPanel<S extends object>({
  form,
  onSearch,
  onReset,
  children,
}: SearchPanelProps<S>) {
  return (
    <div className="search-panel">
      <Form<S> form={form} layout="inline" onFinish={onSearch}>
        {children}
        <div className="search-actions">
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              重置
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}

export default SearchPanel;
