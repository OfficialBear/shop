import SearchPanel from '@/components/SearchPanel';
import { useCategoryOptions } from '@/hooks/categoryOptions';
import { SearchParams } from '@/pages/Dish/type';
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
}) => {
  const { options, loading } = useCategoryOptions(1);

  return (
    <SearchPanel form={form} onSearch={handleSearch} onReset={handleReset}>
      <Row gutter={32}>
        <Col span={12}>
          <Form.Item label="菜品名称" name="name">
            <Input placeholder="请输入菜品名称" allowClear />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="菜品分类" name="categoryId">
            <Select
              placeholder="请选择"
              allowClear
              loading={loading}
              options={options}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="售卖状态" name="status">
            <Select
              placeholder="请选择"
              allowClear
              options={[
                { label: '启售', value: 1 },
                { label: '停售', value: 0 },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
    </SearchPanel>
  );
};

export default SearchForm;
