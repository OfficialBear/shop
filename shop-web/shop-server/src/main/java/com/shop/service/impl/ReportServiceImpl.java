package com.shop.service.impl;

import com.shop.constant.OrderConstant;
import com.shop.exception.BaseException;
import com.shop.mapper.OrderMapper;
import com.shop.mapper.UserMapper;
import com.shop.service.ReportService;
import com.shop.vo.SalesTop10ReportVO;
import com.shop.vo.TurnoverReportVO;
import com.shop.vo.UserReportVO;
import com.shop.utils.ReportExcelWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class ReportServiceImpl implements ReportService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private UserMapper userMapper;

    /**
     * 根据时间区间统计营业额
     *
     * @param begin
     * @param end
     * @return
     */
    public List<TurnoverReportVO> getTurnover(LocalDate begin, LocalDate end) {
        // 入参保护，避免非法区间（含 begin > end）导致死循环
        if (begin == null || end == null || begin.isAfter(end)) {
            return Collections.emptyList();
        }

        // 半开区间 [begin, end + 1天)，避免 LocalTime.MAX 精度问题且便于走索引
        LocalDateTime beginTime = begin.atStartOfDay();
        LocalDateTime endExclusive = end.plusDays(1).atStartOfDay();

        // 单条 SQL 聚合出区间内有数据的每一天
        List<TurnoverReportVO> rows = orderMapper.sumTurnoverGroupByDay(
                OrderConstant.COMPLETED, beginTime, endExclusive);

        Map<String, Double> turnoverByDay = new HashMap<>();
        for (TurnoverReportVO row : rows) {
            if (row != null && row.getDay() != null) {
                turnoverByDay.put(row.getDay(), row.getValue() == null ? 0.0 : row.getValue());
            }
        }

        // 按连续日期补齐，缺口补 0，保证返回天数与请求区间严格一致
        List<TurnoverReportVO> turnoverList = new ArrayList<>();
        for (LocalDate date = begin; !date.isAfter(end); date = date.plusDays(1)) {
            String day = date.toString();
            turnoverList.add(new TurnoverReportVO(day, turnoverByDay.getOrDefault(day, 0.0)));
        }
        return turnoverList;
    }

    @Override
    public List<UserReportVO> getUserStatistics(LocalDate begin, LocalDate end) {
        if (begin == null || end == null || begin.isAfter(end)) {
            return Collections.emptyList();
        }

        // 半开区间 [begin, end + 1天)
        LocalDateTime beginTime = begin.atStartOfDay();
        LocalDateTime endExclusive = end.plusDays(1).atStartOfDay();

        // 区间内每日新增用户：单条 SQL 聚合，替代逐天查询
        List<UserReportVO> rows = userMapper.countNewUsersGroupByDay(beginTime, endExclusive);
        Map<String, Integer> newByDay = new HashMap<>();
        for (UserReportVO row : rows) {
            if (row != null && row.getDay() != null) {
                newByDay.put(row.getDay(), row.getValue() == null ? 0 : row.getValue());
            }
        }

        // 区间开始前的存量用户，作为累计总用户的基数
        Integer before = userMapper.countUsersBefore(beginTime);
        int runningTotal = before == null ? 0 : before;

        // 按连续日期补齐：每天返回「新增」和「总用户（累计）」两条记录
        List<UserReportVO> res = new ArrayList<>();
        for (LocalDate date = begin; !date.isAfter(end); date = date.plusDays(1)) {
            String day = date.toString();
            int newUser = newByDay.getOrDefault(day, 0);
            runningTotal += newUser;
            res.add(new UserReportVO(day, newUser, "new"));
            res.add(new UserReportVO(day, runningTotal, "all"));
        }
        return res;
    }

    @Override
    public List<SalesTop10ReportVO> getSalesTop10(LocalDate begin, LocalDate end) {
        if (begin == null || end == null || begin.isAfter(end)) {
            return Collections.emptyList();
        }

        // 半开区间 [begin, end + 1天)
        LocalDateTime beginTime = begin.atStartOfDay();
        LocalDateTime endExclusive = end.plusDays(1).atStartOfDay();

        return orderMapper.getSalesTop10(beginTime, endExclusive);
    }

    @Override
    public void exportReport(LocalDate begin, LocalDate end, OutputStream outputStream) {
        List<TurnoverReportVO> turnover = getTurnover(begin, end);
        List<UserReportVO> users = getUserStatistics(begin, end);
        List<SalesTop10ReportVO> top10 = getSalesTop10(begin, end);
        try {
            ReportExcelWriter.write(outputStream, begin, end, turnover, users, top10);
        } catch (IOException e) {
            throw new BaseException("导出报表失败: " + e.getMessage());
        }
    }
}
