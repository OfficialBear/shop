import { Button, Col, Form, Input, Row, Select, Space } from 'antd';
import React, { PropsWithChildren } from 'react';

import { SearchParams } from '@/pages/Employee/type';
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
            <Form.Item label="员工姓名" name="name">
              <Input placeholder="请输入员工姓名" allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="账号" name="username">
              <Input placeholder="请输入账号" allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="手机号" name="phone">
              <Input placeholder="请输入手机号" allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="账号状态" name="status">
              <Select
                placeholder="请选择账号状态"
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
