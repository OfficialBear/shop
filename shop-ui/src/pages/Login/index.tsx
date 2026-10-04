import { login } from '@/services/auth';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useSearchParams } from '@umijs/max';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { useState } from 'react';
import styles from './index.less';

interface LoginFormValues {
  username: string;
  password: string;
  remember: boolean;
}

/** 登录成功提示的展示时长，之后整页跳转（毫秒） */
const SUCCESS_REDIRECT_DELAY = 500;

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
      await login({
        username: values.username.trim(),
        password: values.password,
      });
      message.success('Signed in successfully.');

      // 登录成功后后端通过 HttpOnly Cookie 下发令牌，前端不接触令牌。
      // 这里使用整页跳转（而非 history.replace）：让应用携带新 Cookie 重新引导，
      // 待 getInitialState 完成后再渲染受保护路由，从根本上避免
      // “客户端 refresh() 的派发时机” 与 “路由守卫读取 access” 之间的竞态
      //（该竞态曾导致登录成功后需要再登录一次才能跳转）。
      const redirect = searchParams.get('redirect');
      const target = redirect?.startsWith('/') ? redirect : '/';

      // 稍作停留，让「登录成功」提示可见后再整页跳转；
      // 期间保持 loading=true，按钮与表单继续禁用，避免短暂可交互。
      window.setTimeout(() => {
        window.location.replace(target);
      }, SUCCESS_REDIRECT_DELAY);
    } catch {
      // 错误提示由全局请求层统一处理
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
