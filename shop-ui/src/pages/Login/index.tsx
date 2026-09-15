import { login } from '@/services/user/auth';
import { setToken } from '@/utils/request';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { history, useSearchParams } from '@umijs/max';
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
              size="default"
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
              size="default"
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
