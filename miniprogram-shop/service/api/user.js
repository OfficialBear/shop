import request from '../request.js';

// 用户登录
// skipAuthRedirect：登录接口自身 401 不触发全局重定向，避免递归
export const loginByCode = (code) => {
  return request.post('/user/user/login', { code }, { skipAuthRedirect: true });
};