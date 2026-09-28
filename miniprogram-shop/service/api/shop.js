import request from '../request.js';

// 获取店铺营业状态
export const getShopStatus = () => {
  return request.get('/user/shop/status');
};