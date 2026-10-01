import request from '../request.js';

// 提交订单（堂食扫码点餐）
// data: { tableNo, remark, items: [{ type, id, number, dishFlavor }] }
export const submitOrder = (data) => {
  return request.post('/user/order/submit', data);
};

// 模拟支付
export const payOrder = (id) => {
  return request.post(`/user/order/pay/${id}`);
};

// 我的订单分页查询
export const getOrderList = (params) => {
  return request.get('/user/order/list', params);
};

// 订单详情
export const getOrderDetail = (id) => {
  return request.get(`/user/order/detail/${id}`);
};

// 取消订单（仅待付款）
export const cancelOrder = (id) => {
  return request.put(`/user/order/cancel/${id}`);
};
