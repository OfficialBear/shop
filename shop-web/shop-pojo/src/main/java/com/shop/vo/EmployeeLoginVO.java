package com.shop.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 员工登录返回的数据格式
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeLoginVO implements Serializable {

    // 主键值
    private Long id;

    // 用户名
    private String userName;

    // 姓名
    private String name;

    // jwt令牌
    private String token;

}
