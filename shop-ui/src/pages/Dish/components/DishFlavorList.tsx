import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Form, Select, Space } from 'antd';
import React from 'react';

// 常用口味名称，供快速选择（也允许自定义输入）
const FLAVOR_NAME_OPTIONS = [
  { value: '甜度' },
  { value: '辣度' },
  { value: '温度' },
  { value: '忌口' },
];

const DishFlavorList: React.FC = () => {
  return (
    <Form.List name="flavors">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Space
              key={key}
              style={{ display: 'flex', marginBottom: 8 }}
              align="baseline"
            >
              <Form.Item
                {...restField}
                name={[name, 'name']}
                rules={[{ required: true, message: '请输入口味名称' }]}
              >
                <AutoComplete
                  options={FLAVOR_NAME_OPTIONS}
                  placeholder="如：甜度"
                  style={{ width: 120 }}
                />
              </Form.Item>

              <Form.Item
                {...restField}
                name={[name, 'value']}
                rules={[{ required: true, message: '请输入口味值' }]}
              >
                <Select
                  mode="tags"
                  tokenSeparators={[',']}
                  placeholder="回车或逗号分隔，如 3分糖,6分糖"
                  style={{ minWidth: 260 }}
                  open={false} // 不需要下拉，纯输入
                  suffixIcon={null}
                />
              </Form.Item>

              <MinusCircleOutlined
                onClick={() => remove(name)}
                style={{ color: '#999' }}
              />
            </Space>
          ))}

          <Button
            type="dashed"
            onClick={() => add({ name: '', value: [] })}
            block
            icon={<PlusOutlined />}
          >
            添加口味
          </Button>
        </>
      )}
    </Form.List>
  );
};

export default DishFlavorList;
