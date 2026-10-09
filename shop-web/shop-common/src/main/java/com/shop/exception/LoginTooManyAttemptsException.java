package com.shop.exception;

/**
 * 登录尝试过于频繁（达到失败阈值被临时锁定）异常。
 */
public class LoginTooManyAttemptsException extends BaseException {

    public LoginTooManyAttemptsException() {
    }

    public LoginTooManyAttemptsException(String msg) {
        super(msg);
    }
}
