package com.shop.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface SetmealDishMapper {
    /**
     * 根据菜品id查询关联套餐的数量
     *
     * @param dishIds
     * @return
     */
    Integer countByDishId(List<Long> dishIds);
}
