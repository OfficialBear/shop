package com.shop.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserReportVO implements Serializable {
    /**
     * yy-MM-dd
     */
    private String day;
    /**
     * 数值
     */
    private Integer value;

    private String category;
}
