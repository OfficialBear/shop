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

const TABS = [
  { key: 'all', label: '全部', statuses: null },
  { key: 'unpaid', label: '待付款', statuses: [1] },
  { key: 'ongoing', label: '进行中', statuses: [2, 3, 4] },
  { key: 'done', label: '已完成', statuses: [5] }
];

const ACTIONS = {
  1: [
    { key: 'cancel', text: '取消订单', primary: false },
    { key: 'pay', text: '去支付', primary: true }
  ],
  5: [{ key: 'reorder', text: '再来一单', primary: true }],
  6: [{ key: 'reorder', text: '再来一单', primary: false }]
};

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function parseTime(value) {
  if (!value) return null;
  const matched = String(value)
    .replace('T', ' ')
    .match(/^(\d{4})-(\d{2})-(\d{2})[ ]?(\d{2}):(\d{2})/);
  if (!matched) return null;
  return new Date(
    Number(matched[1]),
    Number(matched[2]) - 1,
    Number(matched[3]),
    Number(matched[4]),
    Number(matched[5])
  );
}

function formatTime(value) {
  const date = parseTime(value);
  if (!date) return value || '';

  const now = new Date();
  const hhmm = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const sameYear = date.getFullYear() === now.getFullYear();

  if (
    sameYear &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    return `今天 ${hhmm}`;
  }

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (
    sameYear &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return `昨天 ${hhmm}`;
  }

  if (sameYear) {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${hhmm}`;
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

Page({
  data: {
    tabs: TABS,
    activeTab: 'all',
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

  onTabChange(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.activeTab) return;
    this.setData({ activeTab: key }, () => this.reload());
  },

  async reload() {
    this.setData({ orders: [], pageNum: 1, total: 0, finished: false });
    await this.loadPage();
  },

  async loadPage() {
    if (this.data.loading || this.data.finished) return;
    this.setData({ loading: true });
    try {
      const params = {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      };
      const tab = TABS.find(item => item.key === this.data.activeTab);
      if (tab && tab.statuses) {
        params.statuses = tab.statuses;
      }

      const res = await getOrderList(params);
      const records = (res.records || []).map(order => this.decorate(order));
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

  decorate(order) {
    const items = order.items || [];
    const itemCount = items.reduce((sum, item) => sum + (item.number || 1), 0);
    const images = items.map(item => item.image).filter(Boolean);
    const first = items[0] || {};
    return {
      ...order,
      statusText: STATUS_TEXT[order.status] || '',
      thumbs: images.slice(0, 3),
      moreCount: images.length > 3 ? images.length - 3 : 0,
      itemCount,
      firstName: first.name || '',
      nameSuffix: items.length > 1 ? `等 ${itemCount} 件商品` : '',
      timeText: formatTime(order.orderTime),
      actions: ACTIONS[order.status] || []
    };
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/order/detail/index?id=${e.currentTarget.dataset.id}` });
  },

  goMenu() {
    wx.navigateTo({ url: '/pages/index/index' });
  },

  onAction(e) {
    const { action, id } = e.currentTarget.dataset;
    if (action === 'pay') this.onPay(id);
    else if (action === 'cancel') this.onCancel(id);
    else if (action === 'reorder') this.onReorder(id);
  },

  async onPay(id) {
    try {
      await payOrder(id);
      this.reload();
    } catch (err) {
      // 请求层已提示错误
    }
  },

  onCancel(id) {
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
  },

  onReorder(id) {
    const order = this.data.orders.find(item => item.id === id);
    if (!order || !order.items || !order.items.length) return;
    const lines = order.items.map(item => ({
      dishId: item.dishId || item.setmealId,
      spec: [],
      specText: item.dishFlavor || '',
      quantity: item.number || 1
    }));
    wx.setStorageSync('reorder_cart', { tableNo: order.tableNo || '', lines });
    wx.navigateTo({ url: '/pages/index/index' });
  }
});
