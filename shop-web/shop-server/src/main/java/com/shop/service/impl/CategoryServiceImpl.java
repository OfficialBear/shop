package com.shop.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.shop.constant.MessageConstant;
import com.shop.constant.StatusConstant;
import com.shop.dto.CategoryDTO;
import com.shop.dto.CategoryPageQueryDTO;
import com.shop.dto.MenuItemDTO;
import com.shop.entity.Category;
import com.shop.exception.DeletionNotAllowedException;
import com.shop.mapper.CategoryMapper;
import com.shop.mapper.DishMapper;
import com.shop.mapper.SetmealMapper;
import com.shop.result.PageResult;
import com.shop.service.CategoryService;
import com.shop.vo.MenuVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private DishMapper dishMapper;

    @Autowired
    private SetmealMapper setmealMapper;

    /**
     * 根据类型查询分类
     *
     * @param type
     * @return
     */
    @Override
    public List<Category> queryByType(Integer type) {
        return categoryMapper.queryByType(type);
    }

    /**
     * 分页查询
     *
     * @param dto
     * @return
     */
    @Override
    public PageResult<Category> pageQuery(CategoryPageQueryDTO dto) {
        PageHelper.startPage(dto.getPageNum(), dto.getPageSize());
        Page<Category> page = categoryMapper.pageQuery(dto);
        return new PageResult<>(page.getTotal(), page.getResult());
    }

    /**
     * 新增分类
     *
     * @param categoryDTO
     */
    @Override
    public void add(CategoryDTO categoryDTO) {
        Category category = new Category();
        // 属性拷贝
        BeanUtils.copyProperties(categoryDTO, category);

        // 分类状态默认为禁用状态0
        category.setStatus(StatusConstant.DISABLE);
        categoryMapper.insert(category);
    }

    /**
     * 修改分类
     *
     * @param categoryDTO
     */
    @Override
    public void update(CategoryDTO categoryDTO) {
        Category category = new Category();
        BeanUtils.copyProperties(categoryDTO, category);
        categoryMapper.update(category);
    }

    /**
     * 启用、禁用分类
     *
     * @param status
     * @param id
     */
    @Override
    public void updateStatus(Integer status, Long id) {
        Category category = Category.builder()
                .id(id)
                .status(status)
                .build();
        categoryMapper.update(category);
    }

    /**
     * 根据id删除分类
     *
     * @param id
     */
    @Override
    public void deleteById(Long id) {
        // 查询当前分类是否关联了菜品，如果关联了就抛出业务异常
        Integer count = dishMapper.countByCategoryId(id);
        if (count > 0) {
            // 当前分类下有菜品，不能删除
            throw new DeletionNotAllowedException(MessageConstant.CATEGORY_BE_RELATED_BY_DISH);
        }

        // 查询当前分类是否关联了套餐，如果关联了就抛出业务异常
        count = setmealMapper.countByCategoryId(id);
        if (count > 0) {
            //当前分类下有菜品，不能删除
            throw new DeletionNotAllowedException(MessageConstant.CATEGORY_BE_RELATED_BY_SETMEAL);
        }

        // 删除分类数据
        categoryMapper.deleteById(id);
    }

    @Override
    public List<MenuVO> getMenu() {
        return buildMenu(categoryMapper.selectMenu());
    }

    /**
     * 将菜单明细按分类分组，并按分类 sort 全局排序
     *
     * @param rows 菜品与套餐的平铺明细
     * @return 分类及其明细
     */
    private List<MenuVO> buildMenu(List<MenuItemDTO> rows) {
        return rows.stream()
                .collect(Collectors.groupingBy(
                        MenuItemDTO::getCategoryId,
                        LinkedHashMap::new,
                        Collectors.toList()
                ))
                .entrySet().stream()
                .sorted(Comparator
                        .comparing(
                                (Map.Entry<Long, List<MenuItemDTO>> e) -> e.getValue().get(0).getSort(),
                                Comparator.nullsLast(Comparator.naturalOrder())
                        )
                        .thenComparing(Map.Entry::getKey))
                .map(e -> {
                    MenuItemDTO first = e.getValue().get(0);
                    return MenuVO.builder()
                            .id(e.getKey())
                            .name(first.getCategoryName())
                            .items(e.getValue())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
