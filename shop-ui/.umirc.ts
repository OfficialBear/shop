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
    {
      name: '分类管理',
      path: '/category',
      component: './Category',
    },
    {
      name: '菜品管理',
      path: '/dish',
      component: './Dish',
    },
    {
      name: '套餐管理',
      path: '/setmeal',
      component: './Setmeal',
    },
    {
      name: '员工管理',
      path: '/employee',
      component: './Employee',
    },
    {
      path: '*',
      component: './404',
      layout: false,
    },
  ],
  npmClient: 'pnpm',
  utoopack: {},
});
