import { updatePassword } from '@/services/employee';
import type { FormProps } from 'antd';
import { Form, Input, Modal, message } from 'antd';
import React, { useState } from 'react';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit: FormProps<ChangePasswordFormValues>['onFinish'] = async (
    values,
  ) => {
    setSubmitting(true);
    try {
      await updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success('密码修改成功，请重新登录');
      form.resetFields();
      onClose();
      onSuccess();
    } catch {
      // 错误提示由全局请求层统一处理
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      destroyOnHidden
      title="修改密码"
      width={420}
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="确定"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="原密码"
          name="oldPassword"
          rules={[{ required: true, message: '请输入原密码' }]}
        >
          <Input.Password
            autoComplete="current-password"
            placeholder="请输入原密码"
          />
        </Form.Item>
        <Form.Item
          label="新密码"
          name="newPassword"
          dependencies={['oldPassword']}
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, max: 20, message: '密码长度需为 6-20 位' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('oldPassword') !== value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('新密码不能与原密码相同'));
              },
            }),
          ]}
        >
          <Input.Password
            autoComplete="new-password"
            placeholder="请输入新密码"
          />
        </Form.Item>
        <Form.Item
          label="确认新密码"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请再次输入新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            autoComplete="new-password"
            placeholder="请再次输入新密码"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
