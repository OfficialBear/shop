import { login } from '@/services/user/auth';
import { setToken } from '@/utils/request';
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
      const user = await login({
        username: values.username.trim(),
        password: values.password,
      });
      if (user.token) {
        setToken(user.token);
        // 关键：重新执行 getInitialState，刷新 currentUser 和权限
        // 原因：getInitialState 只会在应用启动时执行一次。SPA 内部路由切换不会重新执行它。
        // Token 过期后跳转登录页再登录，initialState.currentUser 依然是旧的或空的，access.ts 计算出的权限自然也不对。
        await refresh();
      }
      message.success('Signed in successfully.');

      const redirect = searchParams.get('redirect');

      if (redirect?.startsWith('/')) {
        history.replace(redirect);
      } else {
        history.replace('/');
      }
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.',
      );
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

            <button
              type="button"
              className={styles.linkButton}
              onClick={() => history.push('/forgot-password')}
            >
              Forgot password?
            </button>
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

        <div className={styles.register}>
          <span>Don't have an account?</span>

          <button
            type="button"
            className={styles.linkButton}
            onClick={() => history.push('/register')}
          >
            Create account
          </button>
        </div>
      </div>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Your Platform
      </footer>
    </main>
  );
};

export default LoginPage;
