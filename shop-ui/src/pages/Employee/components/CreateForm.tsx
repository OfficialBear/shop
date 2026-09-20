import { createUser, CreateUserParams } from '@/services/user/user';
import type { FormProps } from 'antd';
import { Button, Form, Input, Modal, Select, Space } from 'antd';
import React, { PropsWithChildren } from 'react';

interface CreateFormProps {
  modalVisible: boolean;
  onSuccess: () => Promise<void>;
  onCancel: () => void;
}

const CreateForm: React.FC<PropsWithChildren<CreateFormProps>> = (props) => {
  const { modalVisible, onSuccess, onCancel } = props;

  const onFinish: FormProps<CreateUserParams>['onFinish'] = async (values) => {
    await createUser(values);
    await onSuccess();
    onCancel();
  };

  return (
    <Modal
      destroyOnHidden
      title="新增"
      width={420}
      open={modalVisible}
      onCancel={() => onCancel()}
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
        <Form.Item<CreateUserParams>
          label="姓名"
          name="name"
          rules={[{ required: true, message: '请输入姓名!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<CreateUserParams>
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
        <Form.Item<CreateUserParams> label="身份证号" name="idNumber">
          <Input />
        </Form.Item>
        <Form.Item<CreateUserParams> label="手机号" name="phone">
          <Input />
        </Form.Item>
        <Form.Item<CreateUserParams>
          label="用户名"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={null}>
          <Space>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
            <Button onClick={() => onCancel()}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateForm;
