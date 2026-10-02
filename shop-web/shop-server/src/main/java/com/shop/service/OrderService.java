package com.shop.service;

import com.shop.dto.OrderPageQueryDTO;
import com.shop.dto.OrderSubmitDTO;
import com.shop.result.PageResult;
import com.shop.vo.OrderSubmitVO;
import com.shop.vo.OrderVO;

public interface OrderService {

    /**
     * 提交订单（堂食扫码点餐）
     *
     * @param dto
     * @return
     */
    OrderSubmitVO submit(OrderSubmitDTO dto);

    /**
     * 模拟支付
     *
     * @param id
     * @return
     */
    OrderSubmitVO pay(Long id);

    /**
     * 当前用户订单分页查询
     *
     * @param dto
     * @return
     */
    PageResult<OrderVO> pageQuery(OrderPageQueryDTO dto);

    /**
     * 订单详情
     *
     * @param id
     * @return
     */
    OrderVO getDetail(Long id);

    /**
     * 取消订单（仅待付款）
     *
     * @param id
     */
    void cancel(Long id);
}
