import { getOrderDetail, cancelOrder } from '@/service/api/order';
import { payOrder } from '@/service/pay';

const STATUS_TEXT = {
  1: '待付款',
  2: '待接单',
  3: '已接单',
  4: '派送中',
  5: '已完成',
  6: '已取消'
};

Page({
  data: {
    order: null,
    statusText: '',
    loading: true
  },

  onLoad(options) {
    this.id = options.id;
    this.load();
  },

  async load() {
    this.setData({ loading: true });
    try {
      const order = await getOrderDetail(this.id);
      this.setData({
        order,
        statusText: STATUS_TEXT[order.status] || ''
      });
    } catch (e) {
      // 请求层已提示错误
    } finally {
      this.setData({ loading: false });
    }
  },

  async onPay() {
    try {
      await payOrder(this.id);
      this.load();
    } catch (e) {
      // 请求层已提示错误
    }
  },

  onCancel() {
    wx.showModal({
      title: '提示',
      content: '确定取消该订单吗？',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await cancelOrder(this.id);
          this.load();
        } catch (e) {
          // 请求层已提示错误
        }
      }
    });
  }
});
