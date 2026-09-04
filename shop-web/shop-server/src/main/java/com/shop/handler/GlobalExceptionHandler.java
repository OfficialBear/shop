package com.shop.handler;


import com.shop.exception.BaseException;
import com.shop.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    public Result exceptionHandler(BaseException ex) {
        log.error("global ex:{}", ex.getMessage());
        return Result.error(ex.getMessage());
    }
}
