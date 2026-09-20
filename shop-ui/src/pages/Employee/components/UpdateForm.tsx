import { updateUser, UpdateUserParams } from '@/services/user/user';
import type { User } from '@/types';
import { Button, Form, Input, Modal, Select, Space } from 'antd';
import React, { PropsWithChildren, useEffect } from 'react';

interface UpdateFormProps {
  modalVisible: boolean;
  editingUser: User | null;
  onSuccess: () => Promise<void>;
  onCancel: () => void;
}

const UpdateForm: React.FC<PropsWithChildren<UpdateFormProps>> = (props) => {
  const { modalVisible, editingUser, onCancel, onSuccess } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    if (modalVisible && editingUser) {
      form.setFieldsValue(editingUser);
    }
  }, [modalVisible, editingUser, form]);

  const handleSubmit = async (values: UpdateUserParams) => {
    if (!editingUser) return;
    await updateUser({ ...values, id: editingUser?.id });
    await onSuccess();
    onCancel();
  };

  return (
    <Modal
      destroyOnHidden
      title="修改"
      width={420}
      open={modalVisible}
      onCancel={() => onCancel()}
      footer={null}
    >
      <Form
        form={form}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item<UpdateUserParams>
          label="姓名"
          name="name"
          rules={[{ required: true, message: '请输入姓名!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<UpdateUserParams>
          label="性别"
          name="sex"
          rules={[{ required: true, message: '请选择性别!' }]}
        >
          <Select
            placeholder="请选择性别"
            allowClear
            options={[
              { label: '男', value: '1' },
              { label: '女', value: '0' },
            ]}
          />
        </Form.Item>
        <Form.Item<UpdateUserParams> label="身份证号" name="idNumber">
          <Input />
        </Form.Item>
        <Form.Item<UpdateUserParams> label="手机号" name="phone">
          <Input />
        </Form.Item>
        <Form.Item<UpdateUserParams>
          label="用户名"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input disabled={true} />
        </Form.Item>

        <Form.Item label={null}>
          <Space>
            <Button type="primary" onClick={() => form.submit()}>
              确定
            </Button>
            <Button onClick={() => onCancel()}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateForm;
