package com.shop.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * 下单时的单个商品项
 */
@Data
public class OrderItemDTO implements Serializable {

    // 类型 1菜品 2套餐
    private Integer type;

    // 菜品id 或 套餐id
    private Long id;

    // 数量
    private Integer number;

    // 口味（无口味为空）
    private String dishFlavor;
}
