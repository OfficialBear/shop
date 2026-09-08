package com.shop.mapper;

import com.github.pagehelper.Page;
import com.shop.annotation.AutoFill;
import com.shop.dto.DishPageQueryDTO;
import com.shop.entity.Dish;
import com.shop.enumeration.OperationType;
import com.shop.vo.DishVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DishMapper {

    /**
     * 根据分类id查询菜品数量
     *
     * @param categoryId
     * @return
     */
    Integer countByCategoryId(Long categoryId);

    /**
     * 根据菜品id查询在售中菜品数量
     *
     * @param ids
     * @return
     */
    Integer countOnSaleById(List<Long> ids);

    /**
     * 根据 id 查询菜品
     *
     * @param id
     * @return
     */
    Dish getById(Long id);

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
    Page<DishVO> pageQuery(DishPageQueryDTO dishPageQueryDTO);

    /**
     * 插入菜品数据
     *
     * @param dish
     */
    @AutoFill(value = OperationType.INSERT)
    void insert(Dish dish);

    /**
     * 更新菜品
     *
     * @param dish
     */
    @AutoFill(value = OperationType.UPDATE)
    void update(Dish dish);

    /**
     * 根据id批量删除菜品
     *
     * @param ids
     */
    void deleteBatch(List<Long> ids);

}
