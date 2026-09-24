import ImageUpload from '@/components/Upload';
import { useCategoryOptions } from '@/hooks/categoryOptions';
import { createSetmeal } from '@/services/setmeal';
import type { Setmeal } from '@/types';
import type { FormProps } from 'antd';
import { Button, Form, Input, message, Modal, Select, Space } from 'antd';
import React, { PropsWithChildren } from 'react';
import AddDish from './AddDish';

interface CreateFormProps {
  modalVisible: boolean;
  reloadData: () => Promise<void>;
  hideModal: () => void;
}

const CreateForm: React.FC<PropsWithChildren<CreateFormProps>> = (props) => {
  const { modalVisible, reloadData, hideModal } = props;
  const { options, loading } = useCategoryOptions(2);

  const onFinish: FormProps<Setmeal>['onFinish'] = async (values) => {
    try {
      await createSetmeal(values);
      message.success('添加成功');
      await reloadData();
      hideModal();
    } catch (error) {
      message.error('添加失败');
    }
  };

  return (
    <Modal
      destroyOnHidden
      title="新增"
      width={600}
      open={modalVisible}
      onCancel={() => hideModal()}
      footer={null}
    >
      <Form
        name="basic"
        labelCol={{ flex: '100px' }}
        wrapperCol={{ flex: 1 }}
        onFinish={onFinish}
        autoComplete="off"
        initialValues={{ flavors: [] }}
      >
        <Form.Item<Setmeal>
          label="套餐名称"
          name="name"
          rules={[{ required: true, message: '请输入套餐名称!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<Setmeal>
          label="套餐分类"
          name="categoryId"
          rules={[{ required: true, message: '请选择!' }]}
        >
          <Select
            placeholder="请选择"
            allowClear
            loading={loading}
            options={options}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item<Setmeal> label="套餐价格" name="price">
          <Input addonAfter="元"/>
        </Form.Item>
        <Form.Item<Setmeal> label="套餐菜品" name="setmealDishes">
          <AddDish />
        </Form.Item>
        <Form.Item<Setmeal> label="套餐图片" name="image">
          <ImageUpload />
        </Form.Item>
        <Form.Item<Setmeal>
          label="套餐描述"
          name="description"
          rules={[{ required: false, message: '套餐描述，最长200字!' }]}
        >
          <Input />
        </Form.Item>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
            <Button onClick={() => hideModal()}>取消</Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateForm;
