import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  mock: {},
  layout: {
    title: 'e-shop',
  },
  favicons: ['/favicon.ico'],
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
      access: 'canAccess',
    },
    {
      name: '数据统计',
      path: '/report',
      component: './Report',
      access: 'canAccess',
    },
    {
      name: '分类管理',
      path: '/category',
      component: './Category',
      access: 'canAccess',
    },
    {
      name: '菜品管理',
      path: '/dish',
      component: './Dish',
      access: 'canAccess',
    },
    {
      name: '套餐管理',
      path: '/setmeal',
      component: './Setmeal',
      access: 'canAccess',
    },
    {
      name: '员工管理',
      path: '/employee',
      component: './Employee',
      access: 'canAccess',
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
