import { createUser, UserParams } from '@/services/user';
import type { FormProps } from 'antd';
import { Button, Form, Input, message, Modal, Select, Space } from 'antd';
import React, { PropsWithChildren } from 'react';

interface CreateFormProps {
  modalVisible: boolean;
  reloadData: () => Promise<void>;
  hideModal: () => void;
}

const CreateForm: React.FC<PropsWithChildren<CreateFormProps>> = (props) => {
  const { modalVisible, reloadData, hideModal } = props;

  const onFinish: FormProps<UserParams>['onFinish'] = async (values) => {
    try {
      await createUser(values);
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
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onFinish={onFinish}
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
