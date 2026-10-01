package com.shop.dto;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 提交订单参数（堂食扫码点餐）
 */
@Data
public class OrderSubmitDTO implements Serializable {

    // 桌号
    private String tableNo;

    // 备注
    private String remark;

    // 商品明细
    private List<OrderItemDTO> items;
}
