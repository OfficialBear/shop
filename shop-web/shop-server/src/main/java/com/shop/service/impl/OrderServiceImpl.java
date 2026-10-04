package com.shop.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.shop.auth.LoginUser;
import com.shop.constant.StatusConstant;
import com.shop.context.UserContext;
import com.shop.dto.OrderItemDTO;
import com.shop.dto.OrderPageQueryDTO;
import com.shop.dto.OrderSubmitDTO;
import com.shop.entity.Dish;
import com.shop.entity.Order;
import com.shop.entity.OrderDetail;
import com.shop.entity.User;
import com.shop.exception.BaseException;
import com.shop.mapper.DishMapper;
import com.shop.mapper.OrderDetailMapper;
import com.shop.mapper.OrderMapper;
import com.shop.mapper.SetmealMapper;
import com.shop.mapper.UserMapper;
import com.shop.pay.WechatPayService;
import com.shop.result.PageResult;
import com.shop.service.OrderService;
import com.shop.vo.OrderSubmitVO;
import com.shop.vo.OrderVO;
import com.shop.vo.PrepayVO;
import com.shop.vo.SetmealVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    // 订单状态
    private static final Integer STATUS_PENDING_PAYMENT = 1;
    private static final Integer STATUS_PENDING_ACCEPT = 2;
    private static final Integer STATUS_CANCELLED = 6;

    // 支付状态
    private static final Integer PAY_STATUS_UNPAID = 0;
    private static final Integer PAY_STATUS_PAID = 1;

    // 支付方式：微信
    private static final Integer PAY_METHOD_WECHAT = 1;

    // 商品类型：套餐
    private static final Integer TYPE_SETMEAL = 2;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderDetailMapper orderDetailMapper;

    @Autowired
    private DishMapper dishMapper;

    @Autowired
    private SetmealMapper setmealMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private WechatPayService wechatPayService;

    @Override
    @Transactional
    public OrderSubmitVO submit(OrderSubmitDTO dto) {
        if (dto == null || dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new BaseException("订单商品不能为空");
        }

        Long userId = currentUserId();
        List<OrderDetail> details = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemDTO item : dto.getItems()) {
            if (item == null || item.getId() == null) {
                throw new BaseException("订单商品参数有误");
            }
            Integer number = item.getNumber() == null ? 1 : item.getNumber();
            if (number <= 0) {
                throw new BaseException("商品数量必须大于 0");
            }

            OrderDetail detail = new OrderDetail();
            detail.setNumber(number);
            detail.setDishFlavor(item.getDishFlavor());

            BigDecimal price;
            if (TYPE_SETMEAL.equals(item.getType())) {
                SetmealVO setmeal = setmealMapper.getBySetmealId(item.getId());
                if (setmeal == null || !StatusConstant.ENABLE.equals(setmeal.getStatus())) {
                    throw new BaseException("套餐不存在或已停售");
                }
                detail.setSetmealId(setmeal.getId());
                detail.setName(setmeal.getName());
                detail.setImage(setmeal.getImage());
                price = setmeal.getPrice();
            } else {
                Dish dish = dishMapper.getById(item.getId());
                if (dish == null || !StatusConstant.ENABLE.equals(dish.getStatus())) {
                    throw new BaseException("菜品不存在或已停售");
                }
                detail.setDishId(dish.getId());
                detail.setName(dish.getName());
                detail.setImage(dish.getImage());
                price = dish.getPrice();
            }

            BigDecimal amount = price.multiply(BigDecimal.valueOf(number));
            detail.setAmount(amount);
            total = total.add(amount);
            details.add(detail);
        }

        Order order = Order.builder()
                .number(generateOrderNumber())
                .tableNo(dto.getTableNo())
                .status(STATUS_PENDING_PAYMENT)
                .userId(userId)
                .addressBookId(0L)
                .orderTime(LocalDateTime.now())
                .payMethod(PAY_METHOD_WECHAT)
                .payStatus(PAY_STATUS_UNPAID)
                .amount(total)
                .remark(dto.getRemark())
                .build();
        orderMapper.insert(order);

        for (OrderDetail detail : details) {
            detail.setOrderId(order.getId());
        }
        orderDetailMapper.insertBatch(details);

        return OrderSubmitVO.builder()
                .id(order.getId())
                .number(order.getNumber())
                .amount(total)
                .build();
    }

    @Override
    public PrepayVO prepay(Long id) {
        Long userId = currentUserId();
        Order order = orderMapper.getById(id);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new BaseException("订单不存在");
        }
        if (!STATUS_PENDING_PAYMENT.equals(order.getStatus())) {
            throw new BaseException("订单状态异常，无法支付");
        }

        User user = userMapper.getById(order.getUserId());
        if (user == null || !StringUtils.hasText(user.getOpenid())) {
            throw new BaseException("用户未绑定微信，无法发起支付");
        }

        return wechatPayService.prepay(order, user.getOpenid());
    }

    @Override
    public PageResult<OrderVO> pageQuery(OrderPageQueryDTO dto) {
        dto.setUserId(currentUserId());
        PageHelper.startPage(dto.getPageNum(), dto.getPageSize());
        Page<Order> page = orderMapper.pageQuery(dto);

        List<OrderVO> records = page.getResult().stream()
                .map(this::toVO)
                .collect(Collectors.toList());

        if (!records.isEmpty()) {
            List<Long> orderIds = records.stream().map(OrderVO::getId).collect(Collectors.toList());
            List<OrderDetail> allDetails = orderDetailMapper.getByOrderIds(orderIds);
            Map<Long, List<OrderDetail>> grouped = allDetails.stream()
                    .collect(Collectors.groupingBy(OrderDetail::getOrderId));
            records.forEach(vo -> vo.setItems(grouped.getOrDefault(vo.getId(), new ArrayList<>())));
        }

        return new PageResult<>(page.getTotal(), records);
    }

    @Override
    public OrderVO getDetail(Long id) {
        Long userId = currentUserId();
        Order order = orderMapper.getById(id);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new BaseException("订单不存在");
        }
        OrderVO vo = toVO(order);
        vo.setItems(orderDetailMapper.getByOrderId(id));
        return vo;
    }

    @Override
    public void cancel(Long id) {
        Long userId = currentUserId();
        Order order = orderMapper.getById(id);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new BaseException("订单不存在");
        }
        if (!STATUS_PENDING_PAYMENT.equals(order.getStatus())) {
            throw new BaseException("订单状态异常，无法取消");
        }

        Order update = Order.builder()
                .id(id)
                .status(STATUS_CANCELLED)
                .cancelTime(LocalDateTime.now())
                .cancelReason("用户取消")
                .build();
        orderMapper.update(update);
    }

    private OrderVO toVO(Order order) {
        OrderVO vo = new OrderVO();
        BeanUtils.copyProperties(order, vo);
        return vo;
    }

    private Long currentUserId() {
        LoginUser loginUser = UserContext.getCurrentUser();
        if (loginUser == null || loginUser.getUserId() == null) {
            throw new BaseException("未登录");
        }
        return loginUser.getUserId();
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return timestamp + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
    }
}
