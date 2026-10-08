package com.shop.dto;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

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

    // 订单号（模糊查询）
    private String number;

    // 下单时间起（yyyy-MM-dd，含当天）
    private String beginTime;

    // 下单时间止（yyyy-MM-dd，含当天）
    private String endTime;

    // 订单状态集合（按状态分组筛选，如「进行中」= 2,3,4）
    private List<Integer> statuses;
}
