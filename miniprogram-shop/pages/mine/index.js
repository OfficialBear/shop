import { wxLogout, isLoggedIn, getUser } from '@/service/auth';

Page({
  data: {
    user: null,
    loggedIn: false
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    this.setData({
      user: getUser(),
      loggedIn: isLoggedIn()
    });
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/order/list/index' });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/index' });
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: async (res) => {
        if (!res.confirm) return;
        await wxLogout();
        this.refresh();
      }
    });
  }
});
