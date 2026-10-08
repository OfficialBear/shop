package com.shop.controller.admin;

import com.shop.dto.OrderPageQueryDTO;
import com.shop.result.PageResult;
import com.shop.result.Result;
import com.shop.service.OrderService;
import com.shop.vo.OrderVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管理端-订单接口
 */
@RestController("adminOrderController")
@RequestMapping("/admin/order")
@Slf4j
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * 订单分页查询
     *
     * @param dto
     * @return
     */
    @GetMapping("/page")
    public Result<PageResult<OrderVO>> page(OrderPageQueryDTO dto) {
        log.info("订单分页查询: {}", dto);
        return Result.success(orderService.pageQueryForAdmin(dto));
    }

    /**
     * 订单详情
     *
     * @param id
     * @return
     */
    @GetMapping("/detail/{id}")
    public Result<OrderVO> detail(@PathVariable Long id) {
        log.info("订单详情: {}", id);
        return Result.success(orderService.getDetailForAdmin(id));
    }
}
