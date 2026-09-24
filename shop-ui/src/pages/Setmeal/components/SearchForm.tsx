import { useCategoryOptions } from '@/hooks/categoryOptions';
import { SearchParams } from '@/pages/Setmeal/type';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import { Button, Col, Form, Input, Row, Select, Space } from 'antd';
import React, { PropsWithChildren } from 'react';
import '../index.less';

interface SearchFormProps {
  form: FormInstance<SearchParams>;
  handleSearch: (values: SearchParams) => void;
  handleReset: () => void;
}

const SearchForm: React.FC<PropsWithChildren<SearchFormProps>> = (props) => {
  const { form, handleSearch, handleReset } = props;
  const { options, loading } = useCategoryOptions(1);

  return (
    <div className="search-panel">
      <Form<SearchParams> form={form} layout="inline" onFinish={handleSearch}>
        <Row gutter={32}>
          <Col span={12}>
            <Form.Item label="套餐名称" name="name">
              <Input placeholder="请输入套餐名称" allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="套餐分类" name="categoryId">
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
