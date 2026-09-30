import request from '../request.js';

// 根据分类id查询菜品
export const getDishListByCategoryId = (categoryId) => {
  return request.get('/user/dish/list', { categoryId });
};

// 根据id查询菜品详情（含口味）
export const getDishDetail = (id) => {
  return request.get(`/user/dish/${id}`);
};
