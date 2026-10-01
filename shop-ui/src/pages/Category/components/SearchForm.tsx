import SearchPanel from '@/components/SearchPanel';
import { SearchParams } from '@/pages/Category/type';
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
  </SearchPanel>
);

export default SearchForm;
