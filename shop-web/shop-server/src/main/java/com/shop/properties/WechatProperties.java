package com.shop.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "wechat")
@Data
public class WechatProperties {

    private String appid;
    private String secret;

    /**
     * 商户号
     */
    private String mchId;

    /**
     * 商户 API 证书序列号
     */
    private String mchSerialNo;

    /**
     * 商户 API 私钥（PKCS8）。支持 PEM 文本或 Base64(DER)。
     */
    private String privateKey;

    /**
     * APIv3 密钥（32 字节）
     */
    private String apiV3Key;

    /**
     * 支付结果异步通知地址（公网 HTTPS）
     */
    private String notifyUrl;
}
