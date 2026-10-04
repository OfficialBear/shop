package com.shop.mapper;

import com.github.pagehelper.Page;
import com.shop.dto.OrderPageQueryDTO;
import com.shop.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;

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
     * 根据订单号和用户id查询订单
     * @param number
     * @param userId
     * @return
     */
    Order getByNumber(String number, Long userId);

    /**
     * 分页查询订单
     *
     * @param dto
     * @return
     */
    Page<Order> pageQuery(OrderPageQueryDTO dto);

    /**
     * 条件置为已支付（仅 待付款/未支付 生效），返回受影响行数用于幂等判断
     */
    int markPaid(@Param("id") Long id,
                 @Param("checkoutTime") LocalDateTime checkoutTime);

    /**
     * 动态更新订单（状态、支付、取消等）
     *
     * @param order
     */
    void update(Order order);
}
