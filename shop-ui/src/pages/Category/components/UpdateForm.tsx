import { CategoryParams, updateCategory } from '@/services/category';
import type { Category } from '@/types';
import { Button, Form, Input, Modal, Select, Space, message } from 'antd';
import React, { PropsWithChildren, useEffect } from 'react';

interface UpdateFormProps {
  modalVisible: boolean;
  editingCategory: Category | null;
  reloadData: () => Promise<void>;
  hideModal: () => void;
}

const UpdateForm: React.FC<PropsWithChildren<UpdateFormProps>> = (props) => {
  const { modalVisible, editingCategory, hideModal, reloadData } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    if (modalVisible && editingCategory) {
      form.setFieldsValue(editingCategory);
    }
  }, [modalVisible, editingCategory, form]);

  const handleSubmit = async (values: CategoryParams) => {
    if (!editingCategory) return;
    try {
      await updateCategory({ ...values, id: editingCategory?.id });
      message.success('修改成功');
      await reloadData();
      hideModal();
    } catch (error) {
      message.error('修改失败');
    }
  };

  return (
    <Modal
      destroyOnHidden
      title="修改"
      width={420}
      open={modalVisible}
      onCancel={() => hideModal()}
      footer={null}
    >
      <Form
        form={form}
        name="basic"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onFinish={handleSubmit}
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

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Space>
            <Button type="primary" onClick={() => form.submit()}>
              确定
            </Button>
            <Button onClick={() => hideModal()}>取消</Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateForm;
