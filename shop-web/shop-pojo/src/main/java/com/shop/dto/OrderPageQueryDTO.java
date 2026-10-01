package com.shop.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * 订单分页查询参数
 */
@Data
public class OrderPageQueryDTO implements Serializable {

    private Integer pageNum = 1;

    private Integer pageSize = 10;

    // 下单用户id（由当前登录用户决定，不由前端传入）
    private Long userId;

    // 订单状态，可选
    private Integer status;
}
