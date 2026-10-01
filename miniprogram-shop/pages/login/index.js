import { wxLogin } from '@/service/auth';

Page({
  data: {
    loading: false
  },

  onLoad(options) {
    // 支持登录后回跳：/pages/login/index?redirect=<encoded url>
    this.redirect = options && options.redirect ? decodeURIComponent(options.redirect) : '';
  },

  async onLogin() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      await wxLogin();
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => this.afterLogin(), 600);
    } catch (err) {
      wx.showToast({ title: '登录失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  afterLogin() {
    if (this.redirect) {
      wx.reLaunch({ url: this.redirect });
      return;
    }
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/index/index' });
    }
  }
});
