package com.shop.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    // 订单号
    private String number;

    // 订单状态 1待付款 2待接单 3已接单 4派送中 5已完成 6已取消
    private Integer status;

    // 下单用户id
    private Long userId;

    // 地址id（堂食为 0）
    private Long addressBookId;

    // 下单时间
    private LocalDateTime orderTime;

    // 结账时间
    private LocalDateTime checkoutTime;

    // 支付方式 1微信 2支付宝
    private Integer payMethod;

    // 支付状态 0未支付 1已支付 2退款
    private Integer payStatus;

    // 实收金额
    private BigDecimal amount;

    // 备注
    private String remark;

    // 手机号
    private String phone;

    // 地址
    private String address;

    // 用户名称
    private String userName;

    // 收货人
    private String consignee;

    // 取消原因
    private String cancelReason;

    // 取消时间
    private LocalDateTime cancelTime;

    // 堂食桌号
    private String tableNo;
}
