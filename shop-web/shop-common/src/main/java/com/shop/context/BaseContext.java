package com.shop.context;

import com.shop.auth.LoginUser;

public class BaseContext {
    public static ThreadLocal<LoginUser> threadLocal = new ThreadLocal<>();

    public static void setCurrentUser(LoginUser loginUser) {
        threadLocal.set(loginUser);
    }

    public static LoginUser getCurrentUser() {
        return threadLocal.get();
    }

    public static void clear() {
        threadLocal.remove();
    }
}
