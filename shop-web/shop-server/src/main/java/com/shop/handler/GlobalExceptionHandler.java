package com.shop.handler;


import com.shop.constant.MessageConstant;
import com.shop.exception.BaseException;
import com.shop.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLIntegrityConstraintViolationException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 捕获业务异常
     *
     * @param ex
     * @return
     */
    @ExceptionHandler
    public Result exceptionHandler(BaseException ex) {
        log.error("global ex:{}", ex.getMessage());
        return Result.error(ex.getMessage());
    }

    /**
     * 捕获sql异常
     *
     * @param ex
     * @return
     */
    @ExceptionHandler
    public Result exceptionHandler(SQLIntegrityConstraintViolationException ex) {
        log.error("sql ex:{}", ex.getMessage());
        String message = ex.getMessage();
        if (message.contains("Duplicate entry")) {
            String[] split = message.split(" ");
            String name = split[2];
            return Result.error(name + MessageConstant.ALREADY_EXISTS);
        }
        return Result.error(MessageConstant.UNKNOWN_ERROR);
    }

    /**
     * 兜底：未预期的异常统一返回，保持响应结构一致且不暴露堆栈。
     *
     * @param ex
     * @return
     */
    @ExceptionHandler(Exception.class)
    public Result exceptionHandler(Exception ex) {
        log.error("unexpected ex:{}", ex.getMessage(), ex);
        return Result.error(MessageConstant.UNKNOWN_ERROR);
    }
}
