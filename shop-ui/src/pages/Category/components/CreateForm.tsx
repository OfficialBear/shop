import { CategoryParams, createCategory } from '@/services/category';
import type { FormProps } from 'antd';
import { Button, Form, Input, Modal, Select, Space, message } from 'antd';
import React, { PropsWithChildren } from 'react';

interface CreateFormProps {
  modalVisible: boolean;
  reloadData: () => Promise<void>;
  hideModal: () => void;
}

const CreateForm: React.FC<PropsWithChildren<CreateFormProps>> = (props) => {
  const { modalVisible, reloadData, hideModal } = props;

  const onFinish: FormProps<CategoryParams>['onFinish'] = async (values) => {
    try {
      await createCategory(values);
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
      width={420}
      open={modalVisible}
      onCancel={() => hideModal()}
      footer={null}
    >
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item<CategoryParams>
          label="类型"
          name="type"
          rules={[{ required: true, message: '请选择!' }]}
        >
          <Select
            placeholder="请选择类型"
            allowClear
            options={[
              { label: '菜品', value: 1 },
              { label: '套餐', value: 2 },
            ]}
          />
        </Form.Item>
        <Form.Item<CategoryParams>
          label="分类名称"
          name="name"
          rules={[{ required: true, message: '请输入分类名称!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<CategoryParams> label="排序号" name="sort">
          <Input />
        </Form.Item>

        <Form.Item label={null}>
          <Space>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
            <Button onClick={() => hideModal()}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateForm;
