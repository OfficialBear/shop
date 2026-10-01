package com.shop.mapper;

import com.github.pagehelper.Page;
import com.shop.dto.OrderPageQueryDTO;
import com.shop.entity.Order;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OrderMapper {

    /**
     * 插入订单，回填自增 id
     *
     * @param order
     */
    void insert(Order order);

    /**
     * 根据 id 查询订单
     *
     * @param id
     * @return
     */
    Order getById(Long id);

    /**
     * 分页查询订单
     *
     * @param dto
     * @return
     */
    Page<Order> pageQuery(OrderPageQueryDTO dto);

    /**
     * 动态更新订单（状态、支付、取消等）
     *
     * @param order
     */
    void update(Order order);
}
