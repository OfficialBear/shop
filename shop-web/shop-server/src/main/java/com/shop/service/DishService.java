package com.shop.service;

import com.shop.dto.DishDTO;
import com.shop.dto.DishPageQueryDTO;
import com.shop.entity.Dish;
import com.shop.result.PageResult;
import com.shop.vo.DishVO;

import java.util.List;

public interface DishService {

    /**
     * 根据 id 查询菜品和关联的口味数据
     *
     * @param id
     * @return
     */
    DishVO getByIdWithFlavor(Long id);

    /**
     * 根据分类id查询菜品
     *
     * @param categoryId
     * @return
     */
    List<Dish> getByCategoryId(Long categoryId);

    /**
     * 菜品分页查询
     *
     * @param dishPageQueryDTO
     * @return
     */
    PageResult pageQuery(DishPageQueryDTO dishPageQueryDTO);

    /**
     * 新增菜品
     *
     * @param dishDTO
     */
    void addWithFlavor(DishDTO dishDTO);

    /**
     * 根据id修改菜品和关联的口味
     *
     * @param dishDTO
     */
    void updateWithFlavor(DishDTO dishDTO);

    /**
     * 菜品在售、停售
     *
     * @param status
     * @param id
     */
    void updateStatus(Integer status, Long id);

    /**
     * 批量删除菜品
     *
     * @param ids
     */
    void deleteBatch(List<Long> ids);

}
