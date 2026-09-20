import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'e-shop',
  },
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    },
  },
  routes: [
    {
      path: '/login',
      component: './Login',
      layout: false,   
    },
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
  ],
  npmClient: 'pnpm',
  utoopack: {},
});
