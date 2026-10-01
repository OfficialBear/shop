import SearchPanel from '@/components/SearchPanel';
import { SearchParams } from '@/pages/Employee/type';
import type { FormInstance } from 'antd';
import { Col, Form, Input, Row, Select } from 'antd';
import React from 'react';

interface SearchFormProps {
  form: FormInstance<SearchParams>;
  handleSearch: (values: SearchParams) => void;
  handleReset: () => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  form,
  handleSearch,
  handleReset,
}) => (
  <SearchPanel form={form} onSearch={handleSearch} onReset={handleReset}>
    <Row gutter={32}>
      <Col span={12}>
        <Form.Item label="员工姓名" name="name">
          <Input placeholder="请输入员工姓名" allowClear />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="性别" name="sex">
          <Select
            placeholder="请选择性别"
            allowClear
            options={[
              { label: '男', value: '1' },
              { label: '女', value: '0' },
            ]}
          />
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
  </SearchPanel>
);

export default SearchForm;
