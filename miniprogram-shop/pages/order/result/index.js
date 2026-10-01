Page({
  data: {
    id: '',
    number: '',
    amount: '0.00',
    tableNo: ''
  },

  onLoad(options) {
    this.setData({
      id: options.id || '',
      number: options.number || '',
      amount: options.amount || '0.00',
      tableNo: options.tableNo || ''
    });
  },

  goDetail() {
    wx.redirectTo({ url: `/pages/order/detail/index?id=${this.data.id}` });
  },

  goMenu() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
