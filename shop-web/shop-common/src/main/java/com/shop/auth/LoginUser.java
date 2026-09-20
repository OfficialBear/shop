package com.shop.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginUser implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long userId;
    // 用户名要求唯一，同时也是账号
    private String username;
    // 单个角色
    private String role;
    // 权限码集合，如 ["foo:read", "foo:delete"]
    private Set<String> permissions;
}
