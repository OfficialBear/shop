package com.shop.utils;

import com.shop.entity.Order;
import com.shop.exception.BaseException;
import com.shop.properties.WechatProperties;
import com.shop.vo.PrepayVO;
import com.wechat.pay.java.core.RSAAutoCertificateConfig;
import com.wechat.pay.java.core.exception.ValidationException;
import com.wechat.pay.java.core.notification.NotificationParser;
import com.wechat.pay.java.core.notification.RequestParam;
import com.wechat.pay.java.service.payments.jsapi.JsapiServiceExtension;
import com.wechat.pay.java.service.payments.jsapi.model.Amount;
import com.wechat.pay.java.service.payments.jsapi.model.Payer;
import com.wechat.pay.java.service.payments.jsapi.model.PrepayRequest;
import com.wechat.pay.java.service.payments.jsapi.model.PrepayWithRequestPaymentResponse;
import com.wechat.pay.java.service.payments.model.Transaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 微信支付 APIv3 客户端：基于官方 wechatpay-java SDK 封装 JSAPI 下单、关单与回调解析。
 * <p>
 * SDK 的 RSAAutoCertificateConfig 会自动下载并定时刷新平台证书，因此无需自行管理证书。
 * 配置对象按需惰性构建，避免在未配置商户参数（如本地开发）时启动失败。
 */
@Component
@Slf4j
public class WechatPayUtil {

    @Autowired
    private WechatProperties wechatProperties;

    private volatile RSAAutoCertificateConfig config;
    private volatile JsapiServiceExtension jsapiService;
    private volatile NotificationParser notificationParser;

    /**
     * 创建 JSAPI 预支付，返回小程序支付参数。
     */
    public PrepayVO createJsapiPrepay(Order order, String openid) {
        PrepayRequest request = new PrepayRequest();
        request.setAppid(wechatProperties.getAppid());
        request.setMchid(wechatProperties.getMchId());
        request.setDescription("点餐订单 " + order.getNumber());
        request.setOutTradeNo(order.getNumber());
        request.setNotifyUrl(wechatProperties.getNotifyUrl());

        Amount amount = new Amount();
        amount.setTotal(toFen(order.getAmount()));
        amount.setCurrency("CNY");
        request.setAmount(amount);

        Payer payer = new Payer();
        payer.setOpenid(openid);
        request.setPayer(payer);

        JsapiServiceExtension service = getJsapiService();
        try {
            PrepayWithRequestPaymentResponse response = service.prepayWithRequestPayment(request);
            return PrepayVO.builder()
                    .timeStamp(response.getTimeStamp())
                    .nonceStr(response.getNonceStr())
                    .packageValue(response.getPackageVal())
                    .signType(response.getSignType())
                    .paySign(response.getPaySign())
                    .build();
        } catch (RuntimeException e) {
            log.error("微信支付下单失败: {}", order.getNumber(), e);
            throw new BaseException("微信支付下单失败: " + e.getMessage());
        }
    }


    /**
     * 校验并解密微信支付异步通知，返回类型化的交易对象。
     */
    public Transaction parseNotification(
            String timestamp,
            String nonce,
            String signature,
            String serial,
            String body
    ) {
        RequestParam requestParam = new RequestParam.Builder()
                .serialNumber(serial)
                .nonce(nonce)
                .signature(signature)
                .timestamp(timestamp)
                .body(body)
                .build();
        NotificationParser parser = getNotificationParser();
        try {
            return parser.parse(requestParam, Transaction.class);
        } catch (ValidationException e) {
            throw new BaseException("微信支付回调验签失败");
        } catch (RuntimeException e) {
            throw new BaseException("微信支付回调解析失败: " + e.getMessage());
        }
    }

    private JsapiServiceExtension getJsapiService() {
        if (jsapiService == null) {
            synchronized (this) {
                if (jsapiService == null) {
                    jsapiService = new JsapiServiceExtension.Builder()
                            .config(getConfig())
                            .build();
                }
            }
        }
        return jsapiService;
    }

    private NotificationParser getNotificationParser() {
        if (notificationParser == null) {
            synchronized (this) {
                if (notificationParser == null) {
                    notificationParser = new NotificationParser(getConfig());
                }
            }
        }
        return notificationParser;
    }

    private RSAAutoCertificateConfig getConfig() {
        if (config == null) {
            synchronized (this) {
                if (config == null) {
                    config = buildConfig();
                }
            }
        }
        return config;
    }

    private RSAAutoCertificateConfig buildConfig() {
        if (!StringUtils.hasText(wechatProperties.getMchId())
                || !StringUtils.hasText(wechatProperties.getMchSerialNo())
                || !StringUtils.hasText(wechatProperties.getPrivateKey())
                || !StringUtils.hasText(wechatProperties.getApiV3Key())) {
            throw new BaseException("微信支付未配置，请设置 wechat.* 相关参数");
        }
        return new RSAAutoCertificateConfig.Builder()
                .merchantId(wechatProperties.getMchId())
                // 环境变量中的私钥可能以字面量 \n 分隔，统一还原为换行后再交给 SDK
                .privateKey(wechatProperties.getPrivateKey().replace("\\n", "\n"))
                .merchantSerialNumber(wechatProperties.getMchSerialNo())
                .apiV3Key(wechatProperties.getApiV3Key())
                .build();
    }

    private int toFen(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
    }
}
