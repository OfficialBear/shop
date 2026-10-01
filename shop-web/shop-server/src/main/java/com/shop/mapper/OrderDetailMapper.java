package com.shop.mapper;

import com.shop.entity.OrderDetail;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface OrderDetailMapper {

    /**
     * 批量插入订单明细
     *
     * @param orderDetails
     */
    void insertBatch(List<OrderDetail> orderDetails);

    /**
     * 根据订单id查询明细
     *
     * @param orderId
     * @return
     */
    List<OrderDetail> getByOrderId(Long orderId);

    /**
     * 根据订单id集合批量查询明细（用于订单列表，避免 N+1）
     *
     * @param orderIds
     * @return
     */
    List<OrderDetail> getByOrderIds(List<Long> orderIds);
}
