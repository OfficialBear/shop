package com.shop.aspect;

import com.shop.annotation.AutoFill;
import com.shop.auth.LoginUser;
import com.shop.constant.AutoFillConstant;
import com.shop.context.UserContext;
import com.shop.enumeration.OperationType;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.time.LocalDateTime;

/**
 * 自定义切面，实现公共字段自动填充处理逻辑
 */
@Aspect
@Component
@Slf4j
public class AutoFillAspect {

    /**
     * 切入点
     */
    @Pointcut("execution(* com.shop.mapper.*.*(..)) && @annotation(com.shop.annotation.AutoFill)")
    public void autoFillPointCut() {
    }

    /**
     * 前置通知，在通知中进行公共字段的赋值
     */
    @Before("autoFillPointCut()")
    public void autoFill(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        AutoFill autoFill = signature.getMethod().getAnnotation(AutoFill.class);
        OperationType operationType = autoFill.value();

        Object[] args = joinPoint.getArgs();
        if (args == null || args.length == 0 || args[0] == null) {
            return;
        }

        Object entity = args[0];
        LocalDateTime now = LocalDateTime.now();
        // 无登录上下文时（如系统/定时任务触发）不写入操作人，避免 NPE
        LoginUser loginUser = UserContext.getCurrentUser();
        Long userId = loginUser == null ? null : loginUser.getUserId();

        try {
            if (operationType == OperationType.INSERT) {
                invokeSetter(entity, AutoFillConstant.SET_CREATE_TIME, LocalDateTime.class, now);
                invokeSetter(entity, AutoFillConstant.SET_UPDATE_TIME, LocalDateTime.class, now);
                if (userId != null) {
                    invokeSetter(entity, AutoFillConstant.SET_CREATE_USER, Long.class, userId);
                    invokeSetter(entity, AutoFillConstant.SET_UPDATE_USER, Long.class, userId);
                }
            } else if (operationType == OperationType.UPDATE) {
                invokeSetter(entity, AutoFillConstant.SET_UPDATE_TIME, LocalDateTime.class, now);
                if (userId != null) {
                    invokeSetter(entity, AutoFillConstant.SET_UPDATE_USER, Long.class, userId);
                }
            }
        } catch (ReflectiveOperationException ex) {
            // 不再静默吞掉：公共字段填充失败应阻断写入，避免脏数据
            throw new IllegalStateException("公共字段自动填充失败", ex);
        }
    }

    private void invokeSetter(
            Object entity,
            String setterName,
            Class<?> paramType,
            Object value
    ) throws ReflectiveOperationException {
        Method setter = entity.getClass().getDeclaredMethod(setterName, paramType);
        setter.invoke(entity, value);
    }
}
