import { updateUser, UserParams } from '@/services/user';
import type { User } from '@/types';
import { Button, Form, Input, message, Modal, Select, Space } from 'antd';
import React, { PropsWithChildren, useEffect } from 'react';

interface UpdateFormProps {
  modalVisible: boolean;
  editingUser: User | null;
  reloadData: () => Promise<void>;
  hideModal: () => void;
}

const UpdateForm: React.FC<PropsWithChildren<UpdateFormProps>> = (props) => {
  const { modalVisible, editingUser, hideModal, reloadData } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    if (modalVisible && editingUser) {
      form.setFieldsValue(editingUser);
    }
  }, [modalVisible, editingUser, form]);

  const handleSubmit = async (values: UserParams) => {
    if (!editingUser) return;
    try {
      await updateUser({ ...values, id: editingUser?.id });
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
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item<UserParams>
          label="姓名"
          name="name"
          rules={[{ required: true, message: '请输入姓名!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<UserParams>
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
        <Form.Item<UserParams> label="身份证号" name="idNumber">
          <Input />
        </Form.Item>
        <Form.Item<UserParams> label="手机号" name="phone">
          <Input />
        </Form.Item>
        <Form.Item<UserParams>
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
            <Button onClick={() => hideModal()}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateForm;
