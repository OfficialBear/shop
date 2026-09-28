import request from '../request.js';

// 根据分类id查询菜品
export const getDishListByCategoryId = (categoryId) => {
  return request.post('/user/profile', { categoryId });
};