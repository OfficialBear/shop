package com.shop.mapper;

import com.github.pagehelper.Page;
import com.shop.annotation.AutoFill;
import com.shop.dto.CategoryPageQueryDTO;
import com.shop.entity.Category;
import com.shop.enumeration.OperationType;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CategoryMapper {
    /**
     * 根据类型查询分类
     *
     * @param type
     * @return
     */
    List<Category> queryByType(Integer type);

    /**
     * 分页查询
     *
     * @param categoryPageQueryDTO
     * @return
     */
    Page<Category> pageQuery(CategoryPageQueryDTO categoryPageQueryDTO);

    /**
     * 插入数据
     *
     * @param category
     */
    @AutoFill(value = OperationType.INSERT)
    void insert(Category category);

    /**
     * 根据id修改分类
     *
     * @param category
     */
    @AutoFill(value = OperationType.UPDATE)
    void update(Category category);

    /**
     * 根据id删除分类
     *
     * @param id
     */
    void deleteById(Long id);
}
