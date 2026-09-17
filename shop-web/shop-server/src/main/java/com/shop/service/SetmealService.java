package com.shop.service;

import com.shop.dto.SetmealDTO;
import com.shop.dto.SetmealPageQueryDTO;
import com.shop.entity.Setmeal;
import com.shop.result.PageResult;
import com.shop.vo.DishItemVO;
import com.shop.vo.SetmealVO;

import java.util.List;

public interface SetmealService {

    PageResult pageQuery(SetmealPageQueryDTO setmealPageQueryDTO);

    SetmealVO getBySetmealId(Long id);

    /**
     * 条件查询
     *
     * @param setmeal
     * @return
     */
    List<Setmeal> list(Setmeal setmeal);

    /**
     * 根据id查询菜品选项
     *
     * @param id
     * @return
     */
    List<DishItemVO> getDishItemById(Long id);

    void add(SetmealDTO setmealDTO);

    void update(SetmealDTO setmealDTO);

    /**
     * 套餐起售、停售
     *
     * @param status
     * @param id
     */
    void updateStatus(Integer status, Long id);

    void deleteBatch(List<Long> ids);
}
