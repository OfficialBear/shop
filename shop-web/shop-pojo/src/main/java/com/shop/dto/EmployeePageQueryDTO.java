package com.shop.dto;

import lombok.Data;

@Data
public class EmployeePageQueryDTO {
    // 姓名
    private String name;
    // 页码
    private int pageNum;
    // 每页显示记录数
    private int pageSize;
}
