package com.shop.context;

import com.shop.auth.LoginUser;

/**
 * 当前请求登录用户的 ThreadLocal 持有者。
 */
public final class UserContext {

    private static final ThreadLocal<LoginUser> CURRENT_USER = new ThreadLocal<>();

    private UserContext() {
    }

    public static void setCurrentUser(LoginUser loginUser) {
        CURRENT_USER.set(loginUser);
    }

    public static LoginUser getCurrentUser() {
        return CURRENT_USER.get();
    }

    public static void clear() {
        CURRENT_USER.remove();
    }
}
