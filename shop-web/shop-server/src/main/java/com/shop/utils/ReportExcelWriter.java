package com.shop.utils;

import com.shop.vo.SalesTop10ReportVO;
import com.shop.vo.TurnoverReportVO;
import com.shop.vo.UserReportVO;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 数据统计 Excel 报表生成器（Apache POI）。
 * <p>
 * 产出 4 个 Sheet：汇总、营业额、用户统计、销量Top10，含样式美化与汇总行。
 */
public final class ReportExcelWriter {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final String MONEY_FORMAT = "#,##0.00";
    private static final String INT_FORMAT = "#,##0";

    private static final byte[] BRAND = {(byte) 22, (byte) 119, (byte) 255};
    private static final byte[] WHITE = {(byte) 255, (byte) 255, (byte) 255};
    private static final byte[] BAND = {(byte) 246, (byte) 248, (byte) 251};
    private static final byte[] SUMMARY_BG = {(byte) 232, (byte) 240, (byte) 254};
    private static final byte[] TITLE_TEXT = {(byte) 16, (byte) 24, (byte) 40};
    private static final byte[] MUTED_TEXT = {(byte) 102, (byte) 112, (byte) 133};

    private ReportExcelWriter() {
    }

    public static void write(OutputStream out,
                             LocalDate begin,
                             LocalDate end,
                             List<TurnoverReportVO> turnover,
                             List<UserReportVO> users,
                             List<SalesTop10ReportVO> top10) throws IOException {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Styles styles = new Styles(wb);
            writeSummarySheet(wb, styles, begin, end, turnover, users, top10);
            writeTurnoverSheet(wb, styles, turnover);
            writeUserSheet(wb, styles, users);
            writeTop10Sheet(wb, styles, top10);
            wb.write(out);
        }
    }

    // ==================== Sheet：汇总 ====================

    private static void writeSummarySheet(XSSFWorkbook wb, Styles s,
                                          LocalDate begin, LocalDate end,
                                          List<TurnoverReportVO> turnover,
                                          List<UserReportVO> users,
                                          List<SalesTop10ReportVO> top10) {
        Sheet sheet = wb.createSheet("汇总");
        setWidths(sheet, 2600, 5200, 4600);

        int r = 0;
        r = writeTitle(sheet, s, r, 3, "数据统计报表");
        r = writeMeta(sheet, s, r, 3, begin, end);
        r++;

        Row header = sheet.createRow(r++);
        writeCell(header, 0, "分类", s.header);
        writeCell(header, 1, "指标", s.header);
        writeCell(header, 2, "数值", s.header);
        int headerRow = r - 1;

        double turnoverTotal = sumTurnover(turnover);
        int days = turnover.size();
        double turnoverAvg = days > 0 ? turnoverTotal / days : 0;
        TurnoverReportVO peak = peakTurnover(turnover);

        r = metric(sheet, r, s, "营业额", "区间总营业额（元）", turnoverTotal, s.money);
        r = metric(sheet, r, s, "营业额", "日均营业额（元）", turnoverAvg, s.money);
        r = metric(sheet, r, s, "营业额", "最高单日营业额（元）",
                peak == null ? 0 : peak.getValue(), s.money);
        r = metric(sheet, r, s, "营业额", "最高单日",
                peak == null ? "-" : peak.getDay(), s.text);

        int[] userAgg = aggregateUser(users);
        r = metric(sheet, r, s, "用户统计", "期末总用户数", userAgg[0], s.intNum);
        r = metric(sheet, r, s, "用户统计", "区间新增用户", userAgg[1], s.intNum);
        r = metric(sheet, r, s, "用户统计", "日均新增用户",
                days > 0 ? (double) userAgg[1] / days : 0, s.money);

        int top10Total = sumTop10(top10);
        SalesTop10ReportVO top1 = top10.isEmpty() ? null : top10.get(0);
        r = metric(sheet, r, s, "销量Top10", "Top1 商品",
                top1 == null ? "-" : top1.getName(), s.text);
        r = metric(sheet, r, s, "销量Top10", "Top1 销量",
                top1 == null ? 0 : top1.getValue(), s.intNum);
        metric(sheet, r, s, "销量Top10", "Top10 合计销量", top10Total, s.intNum);

        sheet.createFreezePane(0, headerRow + 1);
    }

    // ==================== Sheet：营业额 ====================

    private static void writeTurnoverSheet(XSSFWorkbook wb, Styles s,
                                           List<TurnoverReportVO> turnover) {
        Sheet sheet = wb.createSheet("营业额");
        setWidths(sheet, 4200, 4200);
        int r = 0;
        r = writeTitle(sheet, s, r, 2, "营业额统计");
        r++;

        Row header = sheet.createRow(r++);
        writeCell(header, 0, "日期", s.header);
        writeCell(header, 1, "营业额（元）", s.header);
        int headerRow = r - 1;

        double total = 0;
        boolean band = false;
        for (TurnoverReportVO item : turnover) {
            double value = item.getValue() == null ? 0 : item.getValue();
            total += value;
            Row row = sheet.createRow(r++);
            writeCell(row, 0, item.getDay(), band ? s.textBand : s.text);
            writeCell(row, 1, value, band ? s.moneyBand : s.money);
            band = !band;
        }
        if (turnover.isEmpty()) {
            writeCell(sheet.createRow(r++), 0, "（无数据）", s.text);
        }

        Row sum = sheet.createRow(r);
        writeCell(sum, 0, "合计", s.summaryLabel);
        writeCell(sum, 1, total, s.summaryMoney);

        sheet.createFreezePane(0, headerRow + 1);
        sheet.setAutoFilter(new CellRangeAddress(headerRow, headerRow, 0, 1));
    }

    // ==================== Sheet：用户统计 ====================

    private static void writeUserSheet(XSSFWorkbook wb, Styles s,
                                       List<UserReportVO> users) {
        Sheet sheet = wb.createSheet("用户统计");
        setWidths(sheet, 4200, 3600, 3600);
        int r = 0;
        r = writeTitle(sheet, s, r, 3, "用户统计");
        r++;

        Row header = sheet.createRow(r++);
        writeCell(header, 0, "日期", s.header);
        writeCell(header, 1, "新增用户", s.header);
        writeCell(header, 2, "总用户", s.header);
        int headerRow = r - 1;

        Map<String, int[]> byDay = groupUsersByDay(users);
        long newTotal = 0;
        int endTotal = 0;
        boolean band = false;
        for (Map.Entry<String, int[]> entry : byDay.entrySet()) {
            int newUser = entry.getValue()[0];
            int allUser = entry.getValue()[1];
            newTotal += newUser;
            endTotal = allUser;
            Row row = sheet.createRow(r++);
            writeCell(row, 0, entry.getKey(), band ? s.textBand : s.text);
            writeCell(row, 1, newUser, band ? s.intNumBand : s.intNum);
            writeCell(row, 2, allUser, band ? s.intNumBand : s.intNum);
            band = !band;
        }
        if (byDay.isEmpty()) {
            writeCell(sheet.createRow(r++), 0, "（无数据）", s.text);
        }

        Row sum = sheet.createRow(r);
        writeCell(sum, 0, "区间新增合计 / 期末总用户", s.summaryLabel);
        writeCell(sum, 1, newTotal, s.summaryInt);
        writeCell(sum, 2, endTotal, s.summaryInt);

        sheet.createFreezePane(0, headerRow + 1);
        sheet.setAutoFilter(new CellRangeAddress(headerRow, headerRow, 0, 2));
    }

    // ==================== Sheet：销量Top10 ====================

    private static void writeTop10Sheet(XSSFWorkbook wb, Styles s,
                                        List<SalesTop10ReportVO> top10) {
        Sheet sheet = wb.createSheet("销量Top10");
        setWidths(sheet, 2400, 5200, 3200);
        int r = 0;
        r = writeTitle(sheet, s, r, 3, "销量排名 Top10");
        r++;

        Row header = sheet.createRow(r++);
        writeCell(header, 0, "排名", s.header);
        writeCell(header, 1, "商品名称", s.header);
        writeCell(header, 2, "销量", s.header);
        int headerRow = r - 1;

        long total = 0;
        int rank = 0;
        boolean band = false;
        for (SalesTop10ReportVO item : top10) {
            rank++;
            int value = item.getValue() == null ? 0 : item.getValue();
            total += value;
            Row row = sheet.createRow(r++);
            writeCell(row, 0, rank, band ? s.intNumBand : s.intNum);
            writeCell(row, 1, item.getName(), band ? s.textBand : s.text);
            writeCell(row, 2, value, band ? s.intNumBand : s.intNum);
            band = !band;
        }
        if (top10.isEmpty()) {
            writeCell(sheet.createRow(r++), 0, "（无数据）", s.text);
        }

        Row sum = sheet.createRow(r);
        writeCell(sum, 0, "合计", s.summaryLabel);
        Cell filler = sum.createCell(1);
        filler.setCellStyle(s.summaryLabel);
        writeCell(sum, 2, total, s.summaryInt);

        sheet.createFreezePane(0, headerRow + 1);
        sheet.setAutoFilter(new CellRangeAddress(headerRow, headerRow, 0, 2));
    }

    // ==================== 通用写入 ====================

    private static int writeTitle(Sheet sheet, Styles s, int rowIndex, int cols, String text) {
        Row row = sheet.createRow(rowIndex);
        row.setHeightInPoints(30);
        Cell cell = row.createCell(0);
        cell.setCellValue(text);
        cell.setCellStyle(s.title);
        for (int i = 1; i < cols; i++) {
            row.createCell(i).setCellStyle(s.title);
        }
        sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, 0, cols - 1));
        return rowIndex + 1;
    }

    private static int writeMeta(Sheet sheet, Styles s, int rowIndex, int cols,
                                 LocalDate begin, LocalDate end) {
        Row row = sheet.createRow(rowIndex);
        Cell cell = row.createCell(0);
        cell.setCellValue("统计区间：" + DATE_FMT.format(begin) + " ~ " + DATE_FMT.format(end)
                + "    导出时间：" + DATETIME_FMT.format(LocalDateTime.now()));
        cell.setCellStyle(s.meta);
        for (int i = 1; i < cols; i++) {
            row.createCell(i).setCellStyle(s.meta);
        }
        sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, 0, cols - 1));
        return rowIndex + 1;
    }

    private static int metric(Sheet sheet, int rowIndex, Styles s,
                              String category, String label, Object value, CellStyle valueStyle) {
        Row row = sheet.createRow(rowIndex);
        writeCell(row, 0, category, s.text);
        writeCell(row, 1, label, s.text);
        Cell cell = row.createCell(2);
        if (value instanceof Number number) {
            cell.setCellValue(number.doubleValue());
        } else {
            cell.setCellValue(value == null ? "" : value.toString());
        }
        cell.setCellStyle(valueStyle);
        return rowIndex + 1;
    }

    private static void writeCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value == null ? "" : value);
        cell.setCellStyle(style);
    }

    private static void writeCell(Row row, int col, Number value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value == null ? 0 : value.doubleValue());
        cell.setCellStyle(style);
    }

    private static void setWidths(Sheet sheet, int... widths) {
        for (int i = 0; i < widths.length; i++) {
            sheet.setColumnWidth(i, widths[i]);
        }
    }

    // ==================== 数据计算 ====================

    private static double sumTurnover(List<TurnoverReportVO> list) {
        double sum = 0;
        for (TurnoverReportVO item : list) {
            sum += item.getValue() == null ? 0 : item.getValue();
        }
        return sum;
    }

    private static TurnoverReportVO peakTurnover(List<TurnoverReportVO> list) {
        TurnoverReportVO peak = null;
        double peakValue = Double.NEGATIVE_INFINITY;
        for (TurnoverReportVO item : list) {
            double value = item.getValue() == null ? 0 : item.getValue();
            if (value > peakValue) {
                peakValue = value;
                peak = item;
            }
        }
        return peak;
    }

    private static int[] aggregateUser(List<UserReportVO> users) {
        int endTotal = 0;
        int newTotal = 0;
        for (UserReportVO item : users) {
            int value = item.getValue() == null ? 0 : item.getValue();
            if ("all".equals(item.getCategory())) {
                endTotal = Math.max(endTotal, value);
            } else if ("new".equals(item.getCategory())) {
                newTotal += value;
            }
        }
        return new int[]{endTotal, newTotal};
    }

    private static Map<String, int[]> groupUsersByDay(List<UserReportVO> users) {
        Map<String, int[]> byDay = new LinkedHashMap<>();
        for (UserReportVO item : users) {
            int[] pair = byDay.computeIfAbsent(item.getDay(), k -> new int[2]);
            int value = item.getValue() == null ? 0 : item.getValue();
            if ("all".equals(item.getCategory())) {
                pair[1] = value;
            } else {
                pair[0] = value;
            }
        }
        return byDay;
    }

    private static int sumTop10(List<SalesTop10ReportVO> list) {
        int sum = 0;
        for (SalesTop10ReportVO item : list) {
            sum += item.getValue() == null ? 0 : item.getValue();
        }
        return sum;
    }

    // ==================== 样式 ====================

    private static final class Styles {
        final CellStyle title;
        final CellStyle meta;
        final CellStyle header;
        final CellStyle text;
        final CellStyle textBand;
        final CellStyle intNum;
        final CellStyle intNumBand;
        final CellStyle money;
        final CellStyle moneyBand;
        final CellStyle summaryLabel;
        final CellStyle summaryInt;
        final CellStyle summaryMoney;

        Styles(XSSFWorkbook wb) {
            DataFormat format = wb.createDataFormat();

            title = base(wb);
            XSSFFont titleFont = wb.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            titleFont.setColor(color(TITLE_TEXT));
            title.setFont(titleFont);
            title.setAlignment(HorizontalAlignment.CENTER);
            title.setVerticalAlignment(VerticalAlignment.CENTER);

            meta = base(wb);
            XSSFFont metaFont = wb.createFont();
            metaFont.setFontHeightInPoints((short) 10);
            metaFont.setColor(color(MUTED_TEXT));
            meta.setFont(metaFont);
            meta.setAlignment(HorizontalAlignment.CENTER);

            header = bordered(wb);
            XSSFFont headerFont = wb.createFont();
            headerFont.setBold(true);
            headerFont.setColor(color(WHITE));
            header.setFont(headerFont);
            header.setFillForegroundColor(color(BRAND));
            header.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            header.setAlignment(HorizontalAlignment.CENTER);

            text = bordered(wb);
            textBand = bordered(wb);
            textBand.setFillForegroundColor(color(BAND));
            textBand.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            intNum = numeric(wb, format, INT_FORMAT, null, false);
            intNumBand = numeric(wb, format, INT_FORMAT, BAND, false);

            money = numeric(wb, format, MONEY_FORMAT, null, false);
            moneyBand = numeric(wb, format, MONEY_FORMAT, BAND, false);

            summaryLabel = bordered(wb);
            XSSFFont summaryFont = wb.createFont();
            summaryFont.setBold(true);
            summaryLabel.setFont(summaryFont);
            summaryLabel.setAlignment(HorizontalAlignment.RIGHT);
            summaryLabel.setFillForegroundColor(color(SUMMARY_BG));
            summaryLabel.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            summaryInt = numeric(wb, format, INT_FORMAT, SUMMARY_BG, true);
            summaryMoney = numeric(wb, format, MONEY_FORMAT, SUMMARY_BG, true);
        }
    }

    private static CellStyle base(XSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private static CellStyle bordered(XSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private static CellStyle numeric(XSSFWorkbook wb, DataFormat format, String pattern,
                                     byte[] fill, boolean bold) {
        XSSFCellStyle style = (XSSFCellStyle) bordered(wb);
        style.setDataFormat(format.getFormat(pattern));
        style.setAlignment(HorizontalAlignment.RIGHT);
        if (fill != null) {
            style.setFillForegroundColor(color(fill));
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }
        if (bold) {
            XSSFFont font = wb.createFont();
            font.setBold(true);
            style.setFont(font);
        }
        return style;
    }

    private static XSSFColor color(byte[] rgb) {
        return new XSSFColor(rgb, null);
    }
}
