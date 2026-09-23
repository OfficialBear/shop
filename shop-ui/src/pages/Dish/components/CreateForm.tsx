import ImageUpload from '@/components/Upload';
import { useCategoryOptions } from '@/hooks/categoryOptions';
import { createDish } from '@/services/dish';
import type { FormProps } from 'antd';
import { Button, Form, Input, message, Modal, Select, Space } from 'antd';
import React, { PropsWithChildren } from 'react';
import { DishFormValues } from '../type';
import DishFlavorList from './DishFlavorList';

interface CreateFormProps {
  modalVisible: boolean;
  reloadData: () => Promise<void>;
  hideModal: () => void;
}

const CreateForm: React.FC<PropsWithChildren<CreateFormProps>> = (props) => {
  const { modalVisible, reloadData, hideModal } = props;
  const { options, loading } = useCategoryOptions(1);

  const onFinish: FormProps<DishFormValues>['onFinish'] = async (values) => {
    const flavors = (values.flavors ?? []).flatMap((f) => {
      if (!f.name || !f.value?.length) return [];
      return [{ name: f.name, value: f.value.join(',') }];
    });

    try {
      await createDish({ ...values, flavors });
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
        <Form.Item<DishFormValues>
          label="菜品名称"
          name="name"
          rules={[{ required: true, message: '请输入菜品名称!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<DishFormValues>
          label="菜品分类"
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
        <Form.Item<DishFormValues> label="菜品价格" name="price">
          <Input />
        </Form.Item>
        <Form.Item<DishFormValues> label="菜品图片" name="image">
          <ImageUpload />
        </Form.Item>
        <Form.Item label="口味配置" wrapperCol={{ span: 24 }}>
          <DishFlavorList />
        </Form.Item>
        <Form.Item<DishFormValues>
          label="菜品描述"
          name="description"
          rules={[{ required: false, message: '菜品描述，最长200字!' }]}
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
