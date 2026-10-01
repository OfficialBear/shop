package com.shop.vo;

import com.shop.entity.OrderDetail;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 订单展示对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderVO implements Serializable {

    private Long id;

    private String number;

    // 1待付款 2待接单 3已接单 4派送中 5已完成 6已取消
    private Integer status;

    private BigDecimal amount;

    private String remark;

    private LocalDateTime orderTime;

    private LocalDateTime checkoutTime;

    private Integer payStatus;

    private Integer payMethod;

    private String tableNo;

    // 订单明细
    private List<OrderDetail> items = new ArrayList<>();
}
