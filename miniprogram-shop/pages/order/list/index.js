import { getOrderList, cancelOrder } from '@/service/api/order';
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
    orders: [],
    pageNum: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    finished: false
  },

  onShow() {
    this.reload();
  },

  onPullDownRefresh() {
    this.reload().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    this.loadPage();
  },

  async reload() {
    this.setData({ orders: [], pageNum: 1, total: 0, finished: false });
    await this.loadPage();
  },

  async loadPage() {
    if (this.data.loading || this.data.finished) return;
    this.setData({ loading: true });
    try {
      const res = await getOrderList({
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      });
      const records = (res.records || []).map(order => ({
        ...order,
        statusText: STATUS_TEXT[order.status] || '',
        summary: this.summary(order.items)
      }));
      const orders = this.data.orders.concat(records);
      const total = res.total || 0;
      this.setData({
        orders,
        total,
        pageNum: this.data.pageNum + 1,
        finished: orders.length >= total
      });
    } catch (e) {
      // 请求层已提示错误
    } finally {
      this.setData({ loading: false });
    }
  },

  summary(items) {
    if (!items || !items.length) return '';
    const names = items.map(i => i.name).join('、');
    return names.length > 20 ? `${names.slice(0, 20)}…` : names;
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/order/detail/index?id=${e.currentTarget.dataset.id}` });
  },

  async onPay(e) {
    try {
      await payOrder(e.currentTarget.dataset.id);
      this.reload();
    } catch (err) {
      // 请求层已提示错误
    }
  },

  onCancel(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定取消该订单吗？',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await cancelOrder(id);
          this.reload();
        } catch (err) {
          // 请求层已提示错误
        }
      }
    });
  }
});
