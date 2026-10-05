const STORAGE_DINERS = 'last_diners';

Page({
  data: {
    dinersVisible: false,
    diners: 2,
    dinersOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },

  onLoad() {
    // 记住上次选择的人数，减少常用路径的操作
    const last = Number(wx.getStorageSync(STORAGE_DINERS));
    if (last > 0) {
      this.setData({ diners: last });
    }
  },

  onChooseDinein() {
    this.setData({ dinersVisible: true });
  },

  onDinersVisibleChange(e) {
    this.setData({ dinersVisible: e.detail.visible });
  },

  onCloseDiners() {
    this.setData({ dinersVisible: false });
  },

  onPickDiners(e) {
    this.setData({ diners: Number(e.currentTarget.dataset.value) });
  },

  onConfirmDiners() {
    if (!this.data.diners) {
      wx.showToast({ title: '请选择就餐人数', icon: 'none' });
      return;
    }
    wx.setStorageSync(STORAGE_DINERS, this.data.diners);
    this.setData({ dinersVisible: false });
    wx.navigateTo({
      url: `/pages/index/index?mode=dinein&diners=${this.data.diners}`
    });
  },

  onChooseDelivery() {
    // 后端暂未支持外送（订单仅含桌号），先提示，待地址簿就绪再接入
    wx.showToast({ title: '外送功能即将开放', icon: 'none' });
  },

  /**
   * 扫码点餐：扫桌码直达点餐页并带上桌号，跳过引导页。
   * 桌码建议编码为 `pages/index/index?tableNo=xxx` 或直接是桌号文本；
   * 平台扫小程序码时会自行落到对应 path，无需此入口。
   */
  onScan() {
    wx.scanCode({
      success: (res) => {
        const tableNo = this.parseTableNo(res.result || res.path || '');
        wx.navigateTo({
          url: `/pages/index/index?mode=dinein&tableNo=${encodeURIComponent(tableNo)}`
        });
      },
      fail: () => {
        // 用户取消扫码，忽略
      }
    });
  },

  parseTableNo(raw) {
    const matched = /[?&]tableNo=([^&#]+)/i.exec(raw || '');
    if (matched) {
      return decodeURIComponent(matched[1]);
    }
    return (raw || '').trim();
  }
});
