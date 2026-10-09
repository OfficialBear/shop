package com.shop.pay;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.shop.entity.Order;
import com.shop.exception.BaseException;
import com.shop.mapper.OrderMapper;
import com.shop.properties.WechatProperties;
import com.shop.utils.WechatPayUtil;
import com.shop.vo.PrepayVO;
import com.shop.websocket.WebSocketServer;
import com.wechat.pay.java.service.payments.model.Transaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 微信支付业务：预支付、异步通知。
 */
@Service
@Slf4j
public class WechatPayService {

    @Autowired
    private WechatPayUtil wechatPayUtil;

    @Autowired
    private WechatProperties wechatProperties;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private WebSocketServer webSocketServer;

    /**
     * 创建预支付，返回小程序支付参数。
     */
    public PrepayVO prepay(Order order, String openid) {
        return wechatPayUtil.createJsapiPrepay(order, openid);
    }

    /**
     * 处理微信支付异步通知：验签 → 解密 → 校验 → 幂等更新订单。
     */
    public boolean handleNotify(
            String timestamp,
            String nonce,
            String signature,
            String serial,
            String body
    ) {
        // 快速忽略非支付成功事件（原始报文解析，仅用于分支，不参与业务处理）
        JSONObject root = JSON.parseObject(body);
        String eventType = root.getString("event_type");
        if (!"TRANSACTION.SUCCESS".equals(eventType)) {
            log.info("忽略非支付成功事件: {}", eventType);
            return true;
        }

        // SDK 完成验签、AES-GCM 解密并映射为类型化交易对象
        Transaction transaction = wechatPayUtil.parseNotification(
                timestamp, nonce, signature, serial, body);
        if (transaction.getTradeState() != Transaction.TradeStateEnum.SUCCESS) {
            return true;
        }
        applyPaid(transaction);
        return true;
    }

    private void applyPaid(Transaction transaction) {
        String outTradeNo = transaction.getOutTradeNo();
        String transactionId = transaction.getTransactionId();
        log.info("商户平台订单号：{}", outTradeNo);
        log.info("微信支付交易号：{}", transactionId);
        String mchid = transaction.getMchid();
        String appid = transaction.getAppid();
        Integer totalFen = transaction.getAmount() == null
                ? null
                : transaction.getAmount().getTotal();

        if (!wechatProperties.getMchId().equals(mchid)) {
            throw new BaseException("微信支付商户号不匹配");
        }
        if (!wechatProperties.getAppid().equals(appid)) {
            throw new BaseException("微信支付 appid 不匹配");
        }

        Order order = orderMapper.getByNumber(outTradeNo);
        if (order == null) {
            throw new BaseException("订单不存在: " + outTradeNo);
        }

        int expectedFen = order.getAmount()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
        if (totalFen == null || expectedFen != totalFen) {
            throw new BaseException("微信支付金额不匹配: " + outTradeNo);
        }

        // 条件更新：仅 待付款/未支付 才置为已支付，天然幂等
        int updated = orderMapper.markPaid(order.getId(), LocalDateTime.now());
        if (updated > 0) {
            log.info("订单支付成功: {} -> {}", outTradeNo, transactionId);

            Map<String, Object> map = new HashMap<>();
            map.put("type", 1);//消息类型，1表示来单提醒
            map.put("orderId", order.getId());
            map.put("content", "订单号：" + outTradeNo);

            // 通过WebSocket实现来单提醒，向客户端浏览器推送消息
            webSocketServer.sendToAllClient(JSON.toJSONString(map));
        }
    }
}
