package com.shop.controller.user;

import com.shop.dto.OrderPageQueryDTO;
import com.shop.dto.OrderSubmitDTO;
import com.shop.result.PageResult;
import com.shop.result.Result;
import com.shop.service.OrderService;
import com.shop.vo.OrderSubmitVO;
import com.shop.vo.OrderVO;
import com.shop.vo.PrepayVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * C端-订单接口（堂食扫码点餐）
 */
@RestController
@RequestMapping("/user/order")
@Slf4j
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * 提交订单
     */
    @PostMapping("/submit")
    public Result<OrderSubmitVO> submit(@RequestBody OrderSubmitDTO dto) {
        log.info("提交订单: {}", dto);
        return Result.success(orderService.submit(dto));
    }

    /**
     * 发起预支付：返回小程序支付参数
     */
    @PostMapping("/prepay/{id}")
    public Result<PrepayVO> prepay(@PathVariable Long id) {
        log.info("订单预支付: {}", id);
        return Result.success(orderService.prepay(id));
    }

    /**
     * 我的订单分页查询
     */
    @GetMapping("/list")
    public Result<PageResult<OrderVO>> list(OrderPageQueryDTO dto) {
        return Result.success(orderService.pageQuery(dto));
    }

    /**
     * 订单详情
     */
    @GetMapping("/detail/{id}")
    public Result<OrderVO> detail(@PathVariable Long id) {
        return Result.success(orderService.getDetail(id));
    }

    /**
     * 取消订单
     */
    @PutMapping("/cancel/{id}")
    public Result<String> cancel(@PathVariable Long id) {
        orderService.cancel(id);
        return Result.success();
    }
}
