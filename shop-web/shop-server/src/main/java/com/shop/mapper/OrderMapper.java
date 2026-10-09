package com.shop.mapper;

import com.github.pagehelper.Page;
import com.shop.dto.OrderPageQueryDTO;
import com.shop.entity.Order;
import com.shop.vo.SalesTop10ReportVO;
import com.shop.vo.TurnoverReportVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

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
     * 根据订单号查询订单
     *
     * @param number
     * @return
     */
    Order getByNumber(String number);

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

    /**
     * 根据状态和下单时间查询订单
     *
     * @param status    订单状态
     * @param orderTime 下单时间上界（不含）
     * @return 符合条件的订单
     */
    List<Order> getByStatusAndOrdertimeLT(Integer status, LocalDateTime orderTime);

    /**
     * 按天统计营业额（仅统计指定状态、下单时间在 [begin, endExclusive) 内的订单）。
     * <p>
     * 单条 SQL 完成区间聚合，替代逐天查询；仅返回有数据日期的记录，缺口由调用方补零。
     *
     * @param status       订单状态
     * @param begin        下单时间起点（含）
     * @param endExclusive 下单时间终点（不含）
     * @return 有数据日期的日营业额列表
     */
    List<TurnoverReportVO> sumTurnoverGroupByDay(@Param("status") Integer status,
                                                 @Param("begin") LocalDateTime begin,
                                                 @Param("endExclusive") LocalDateTime endExclusive);

    /**
     * 查询商品销量排名
     *
     * @param begin
     * @param endExclusive
     */
    List<SalesTop10ReportVO> getSalesTop10(LocalDateTime begin, LocalDateTime endExclusive);
}
