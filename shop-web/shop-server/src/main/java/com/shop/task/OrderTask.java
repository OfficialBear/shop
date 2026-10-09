package com.shop.task;

import com.shop.constant.OrderConstant;
import com.shop.entity.Order;
import com.shop.mapper.OrderMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

/**
 * 自定义定时任务，实现订单状态定时处理
 */
@Component
@Slf4j
public class OrderTask {

    /**
     * 支付超时分钟数
     */
    private static final int TIMEOUT_MINUTES = 15;

    /**
     * 派送中订单自动完成的等待分钟数
     */
    private static final int DELIVERY_TIMEOUT_MINUTES = 60;

    @Autowired
    private OrderMapper orderMapper;

    /**
     * 处理支付超时订单
     */
    @Scheduled(cron = "0 * * * * ?")
    public void processTimeoutOrder() {
        log.info("处理支付超时订单：{}", new Date());

        LocalDateTime time = LocalDateTime.now().minusMinutes(TIMEOUT_MINUTES);

        // select * from orders where status = 1 and order_time < 当前时间-15分钟
        List<Order> ordersList = orderMapper.getByStatusAndOrdertimeLT(OrderConstant.PENDING_PAYMENT, time);
        if (ordersList != null && !ordersList.isEmpty()) {
            ordersList.forEach(order -> {
                order.setStatus(OrderConstant.CANCELLED);
                order.setCancelReason("支付超时，自动取消");
                order.setCancelTime(LocalDateTime.now());
                orderMapper.update(order);
            });
        }
    }

    /**
     * 处理“派送中”状态的订单
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void processDeliveryOrder() {
        log.info("处理派送中订单：{}", new Date());
        // select * from orders where status = 4 and order_time < 当前时间-1小时
        LocalDateTime time = LocalDateTime.now().minusMinutes(DELIVERY_TIMEOUT_MINUTES);
        List<Order> ordersList = orderMapper.getByStatusAndOrdertimeLT(OrderConstant.DELIVERY_IN_PROGRESS, time);

        if (ordersList != null && !ordersList.isEmpty()) {
            ordersList.forEach(order -> {
                order.setStatus(OrderConstant.COMPLETED);
                orderMapper.update(order);
            });
        }
    }

}
