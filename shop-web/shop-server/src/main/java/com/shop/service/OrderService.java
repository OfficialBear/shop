package com.shop.service;

import com.shop.dto.OrderPageQueryDTO;
import com.shop.dto.OrderSubmitDTO;
import com.shop.result.PageResult;
import com.shop.vo.OrderSubmitVO;
import com.shop.vo.OrderVO;
import com.shop.vo.PrepayVO;

public interface OrderService {

    /**
     * 提交订单（堂食扫码点餐）
     *
     * @param dto
     * @return
     */
    OrderSubmitVO submit(OrderSubmitDTO dto);

    /**
     * 发起预支付：返回小程序支付参数。
     *
     * @param id
     * @return
     */
    PrepayVO prepay(Long id);

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

    /**
     * 用户催单
     *
     * @param id
     */
    void reminder(Long id);
}
