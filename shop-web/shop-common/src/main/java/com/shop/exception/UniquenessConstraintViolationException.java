package com.shop.exception;

/**
 * 违反唯一性约束异常
 */
public class UniquenessConstraintViolationException extends BaseException {
    public UniquenessConstraintViolationException() {
    }

    public UniquenessConstraintViolationException(String msg) {
        super(msg);
    }
}
