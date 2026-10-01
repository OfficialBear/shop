import { submitOrder, payOrder } from '@/service/api/order';

Page({
  data: {
    tableNo: '',
    remark: '',
    items: [],
    totalPrice: '0.00',
    submitting: false
  },

  onLoad() {
    const pending = wx.getStorageSync('pending_order');
    if (!pending || !pending.items || !pending.items.length) {
      wx.showToast({ title: '结算数据已失效', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
    this.setData({
      tableNo: pending.tableNo || '',
      remark: pending.remark || '',
      items: pending.items,
      totalPrice: pending.totalPrice || '0.00'
    });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  async onSubmit() {
    if (this.data.submitting) return;
    this.setData({ submitting: true });
    try {
      // 仅提交后端需要的字段，金额由后端按 id 重新计算
      const items = this.data.items.map(i => ({
        type: i.type,
        id: i.id,
        number: i.number,
        dishFlavor: i.dishFlavor
      }));

      const submitted = await submitOrder({
        tableNo: this.data.tableNo,
        remark: this.data.remark,
        items
      });

      // 模拟支付：提交后立即支付
      await payOrder(submitted.id);

      wx.removeStorageSync('pending_order');
      // 标记需要清空菜单页购物车（tab 页常驻内存，onShow 时处理）
      const app = getApp();
      if (app && app.globalData) app.globalData.clearCartOnShow = true;
      wx.redirectTo({
        url: `/pages/order/result/index?id=${submitted.id}&number=${submitted.number}&amount=${submitted.amount}&tableNo=${this.data.tableNo}`
      });
    } catch (e) {
      // 请求层已提示错误
    } finally {
      this.setData({ submitting: false });
    }
  }
});
