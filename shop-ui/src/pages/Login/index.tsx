import { login } from '@/services/auth';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel, useSearchParams } from '@umijs/max';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { useState } from 'react';
import styles from './index.less';

interface LoginFormValues {
  username: string;
  password: string;
  remember: boolean;
}

const LoginPage = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  // 从 @@initialState model 中取出 refresh 方法
  const { refresh } = useModel('@@initialState');
  const handleSubmit = async (values: LoginFormValues) => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await login({
        username: values.username.trim(),
        password: values.password,
      });
      // 登录成功后后端通过 HttpOnly Cookie 下发令牌，前端不接触令牌；
      // 刷新 initialState 以更新 currentUser 与权限。
      await refresh();
      message.success('Signed in successfully.');

      const redirect = searchParams.get('redirect');

      if (redirect?.startsWith('/')) {
        history.replace(redirect);
      } else {
        history.replace('/');
      }
    } catch {
      // 错误提示由全局请求层统一处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.loginCard}>
        <header className={styles.header}>
          {/* <div className={styles.logo}>P</div> */}

          <h1>Welcome back!</h1>

          <p>Sign in to continue to your account</p>
        </header>

        <Form<LoginFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{
            remember: true,
          }}
          onFinish={handleSubmit}
          autoComplete="on"
        >
          <Form.Item
            label="Account"
            name="username"
            rules={[
              {
                required: true,
                message: 'Please enter your account.',
              },
            ]}
          >
            <Input
              size="middle"
              prefix={<UserOutlined />}
              placeholder="Enter your account"
              autoComplete="username"
              disabled={loading}
              spellCheck={false}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: 'Please enter your password.',
              },
            ]}
          >
            <Input.Password
              size="middle"
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />
          </Form.Item>

          <div className={styles.options}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox disabled={loading}>Remember me</Checkbox>
            </Form.Item>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            className={styles.submitButton}
          >
            Sign in
          </Button>
        </Form>
      </div>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Your Platform
      </footer>
    </main>
  );
};

export default LoginPage;
