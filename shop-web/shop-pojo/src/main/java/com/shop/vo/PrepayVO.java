package com.shop.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 小程序预支付参数。
 * <p>
 * 注意：微信 {@code wx.requestPayment} 要求参数名为 {@code package}，但 {@code package} 是 Java
 * 关键字无法作字段名，且本模块刻意不引入 Jackson 注解（保持 pojo 零第三方依赖）。
 * 因此字段命名为 {@code packageValue}，序列化后的 JSON 键即为 {@code packageValue}，
 * 由小程序端映射为 {@code package} 后再调用 {@code wx.requestPayment}。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrepayVO implements Serializable {

    private String timeStamp;

    private String nonceStr;

    // 值为 "prepay_id=xxx"；小程序端需映射为 wx.requestPayment 的 package 参数
    private String packageValue;

    private String signType;

    private String paySign;
}
