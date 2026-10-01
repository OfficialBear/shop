import {
  setUnauthorizedHandler,
  setLoginProvider,
  setSessionGate
} from '@/service/request.js';
import { wxLogin, bootstrap } from '@/service/auth.js';

App({
  globalData: {
    // 下单支付成功后置为 true，菜单页 onShow 时据此清空购物车
    clearCartOnShow: false
  },

  onLaunch() {
    // 登录请求合并：所有登录入口共享同一个进行中的登录请求，避免并发重复登录
    setLoginProvider(wxLogin);
    // 会话门闸：请求发出前等待启动登录完成，避免无 token 请求触发 401
    setSessionGate(bootstrap);
    // 无独立登录页：401 由 request 层静默重登并重试；仅当重登失败时提示一次
    setUnauthorizedHandler(() => {
      wx.showToast({ title: '登录已失效，请稍后重试', icon: 'none' });
    });

    // 启动登录（不阻塞启动，请求层会自动等待其完成）
    bootstrap();
  }
});
