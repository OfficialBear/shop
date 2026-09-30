package com.shop.dto;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class MenuItemDTO implements Serializable {

    // 分类id
    private Long categoryId;
    // 分类名称
    private String categoryName;

    // 类型: 1菜品分类 2套餐分类
    private Integer type;

    // 分类顺序
    private Integer sort;

    // 菜品 或 套餐 id
    private Long id;

    // 菜品或套餐名称
    private String name;
    // 菜品或套餐价格
    private BigDecimal price;
    // 图片
    private String image;
    // 描述信息
    private String description;

    private boolean hasFlavor = false;

}
