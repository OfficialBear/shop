package com.shop.mapper;

import com.shop.entity.DishFlavor;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DishFlavorMapper {

    /**
     * 根据菜品id查询口味数据
     *
     * @return
     */
    List<DishFlavor> getByDishId(Long dishId);

    /**
     * 批量插入口味数据
     *
     * @param dishFlavors
     */
    void insertBatch(List<DishFlavor> dishFlavors);

    /**
     * 根据菜品id批量删除口味数据
     *
     * @param dishIds
     */
    void deleteBatch(List<Long> dishIds);

}
