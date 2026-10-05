package com.shop.service;

import com.shop.vo.SalesTop10ReportVO;
import com.shop.vo.TurnoverReportVO;
import com.shop.vo.UserReportVO;

import java.io.OutputStream;
import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    /**
     * 根据时间区间统计营业额
     *
     * @param beginTime
     * @param endTime
     * @return
     */
    List<TurnoverReportVO> getTurnover(LocalDate beginTime, LocalDate endTime);

    /**
     * 根据时间区间统计用户数量
     *
     * @param begin
     * @param end
     * @return
     */
    List<UserReportVO> getUserStatistics(LocalDate begin, LocalDate end);

    /**
     * 查询指定时间区间内的销量排名top10
     *
     * @param begin
     * @param end
     * @return
     */
    List<SalesTop10ReportVO> getSalesTop10(LocalDate begin, LocalDate end);

    /**
     * 导出指定区间的数据统计 Excel 报表（营业额/用户/销量Top10）。
     *
     * @param begin        起始日期（含）
     * @param end          结束日期（含）
     * @param outputStream 输出流
     */
    void exportReport(LocalDate begin, LocalDate end, OutputStream outputStream);
}
