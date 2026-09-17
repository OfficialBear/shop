package com.shop.mapper;

import com.github.pagehelper.Page;
import com.shop.annotation.AutoFill;
import com.shop.dto.SetmealPageQueryDTO;
import com.shop.entity.Setmeal;
import com.shop.enumeration.OperationType;
import com.shop.vo.SetmealVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface SetmealMapper {

    /**
     * 根据分类id查询套餐的数量
     *
     * @param id
     * @return
     */
    Integer countByCategoryId(Long id);

    @AutoFill(value = OperationType.INSERT)
    void insert(Setmeal setmeal);

    @AutoFill(value = OperationType.UPDATE)
    void update(Setmeal setmeal);

    void deleteBatch(List<Long> ids);

    SetmealVO getBySetmealId(Long id);

    Page<Setmeal> pageQuery(SetmealPageQueryDTO setmealPageQueryDTO);
}
