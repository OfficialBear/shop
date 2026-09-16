package com.shop.exception;

/**
 * 登录失败异常
 */
public class LoginFailedException extends BaseException {

    public LoginFailedException() {
    }

    public LoginFailedException(String msg) {
        super(msg);
    }

}