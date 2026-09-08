package com.shop.service;

import com.shop.dto.CategoryDTO;
import com.shop.dto.CategoryPageQueryDTO;
import com.shop.entity.Category;
import com.shop.result.PageResult;

import java.util.List;

public interface CategoryService {

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
     * @param dto
     * @return
     */
    PageResult pageQuery(CategoryPageQueryDTO dto);

    /**
     * 新增分类
     *
     * @param categoryDTO
     */
    void add(CategoryDTO categoryDTO);

    /**
     * 修改分类
     *
     * @param categoryDTO
     */
    void update(CategoryDTO categoryDTO);

    /**
     * 启用、禁用分类
     *
     * @param status
     * @param id
     */
    void updateStatus(Integer status, Long id);

    /**
     * 根据id删除分类
     *
     * @param id
     */
    void deleteById(Long id);
}
