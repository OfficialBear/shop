import request from '../request.js';

// 获取分类
export const getCategoryList = (params) => {
  return request.get('/user/category/menu', params);
};