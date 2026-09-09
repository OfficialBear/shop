package com.shop.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 数据字典
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataDictionary implements Serializable {
    private Long id;
    private String dicParentCode;
    private String dicCode;
    private String dicValue;
    private String description;
    // 排序字段
    private Integer sort;
    // 字典项启用/禁用 1: enabled, 0: disabled
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Long createUser;
    private Long updateUser;
}
