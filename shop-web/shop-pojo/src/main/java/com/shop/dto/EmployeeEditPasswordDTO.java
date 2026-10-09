package com.shop.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * 员工修改密码时传递的数据模型
 */
@Data
public class EmployeeEditPasswordDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 原密码 */
    private String oldPassword;

    /** 新密码 */
    private String newPassword;
}
