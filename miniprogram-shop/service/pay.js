import { getOrderDetail, prepayOrder } from './api/order';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 统一支付入口：预支付 → 拉起微信收银台（wxpay）→ 轮询确认支付结果。
 * 支付结果以服务端订单状态为准，不依赖 wx.requestPayment 回调。
 *
 * @param {number|string} orderId
 * @returns {Promise<boolean>} 是否已确认支付成功
 */
export async function payOrder(orderId) {
  const prepay = await prepayOrder(orderId);

  await new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: prepay.timeStamp,
      nonceStr: prepay.nonceStr,
      // 后端字段名为 packageValue（package 是 Java 关键字），此处映射为微信要求的 package
      package: prepay.packageValue,
      signType: prepay.signType,
      paySign: prepay.paySign,
      success: resolve,
      fail: reject,
    });
  });

  return waitPaid(orderId);
}

async function waitPaid(orderId, times = 5) {
  for (let i = 0; i < times; i++) {
    const detail = await getOrderDetail(orderId);
    if (detail && detail.payStatus === 1) {
      return true;
    }
    await sleep(1000);
  }
  return false;
}
