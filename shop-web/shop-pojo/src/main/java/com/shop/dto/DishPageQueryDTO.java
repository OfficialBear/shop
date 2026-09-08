package com.shop.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class DishPageQueryDTO implements Serializable {

    private int pageNum;
    private int pageSize;
    private String name;
    private Integer categoryId; // 分类id
    private Integer status; // 状态 0表示禁用 1表示启用

}
