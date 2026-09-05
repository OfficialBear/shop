package com.shop.dto;


import lombok.Data;

import java.io.Serializable;

/**
 * 员工登录时传递的数据模型
 */
@Data
public class EmployeeLoginDTO implements Serializable {

    private String username;

    private String password;

}
