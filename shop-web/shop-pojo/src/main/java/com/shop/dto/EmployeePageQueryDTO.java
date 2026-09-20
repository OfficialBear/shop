package com.shop.dto;

import lombok.Data;

@Data
public class EmployeePageQueryDTO {
    // 姓名
    private String name;
    // 性别
    private String sex;
    // 账号
    private String username;
    // 账号状态
    private Integer status;

    private String phone;

    // 页码
    private int pageNum;
    // 每页显示记录数
    private int pageSize;
}
