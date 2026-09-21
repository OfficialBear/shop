import { Button, Col, Form, Input, Row, Select, Space } from 'antd';
import React, { PropsWithChildren } from 'react';

import { SearchParams } from '@/pages/Dish/type';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import '../index.less';

interface SearchFormProps {
  form: FormInstance<SearchParams>;
  handleSearch: (values: SearchParams) => void;
  handleReset: () => void;
}

const SearchForm: React.FC<PropsWithChildren<SearchFormProps>> = (props) => {
  const { form, handleSearch, handleReset } = props;
  return (
    <div className="search-panel">
      <Form<SearchParams> form={form} layout="inline" onFinish={handleSearch}>
        <Row gutter={32}>
          <Col span={12}>
            <Form.Item label="分类名称" name="name">
              <Input placeholder="请输入分类名称" allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="分类类型" name="type">
              <Select
                placeholder="请选择"
                allowClear
                options={[
                  { label: '菜品', value: 1 },
                  { label: '套餐', value: 2 },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="状态" name="status">
              <Select
                placeholder="请选择"
                allowClear
                options={[
                  { label: '启用', value: 1 },
                  { label: '禁用', value: 0 },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="search-actions">
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default SearchForm;
