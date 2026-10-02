package com.shop.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.shop.constant.MessageConstant;
import com.shop.constant.StatusConstant;
import com.shop.dto.DishDTO;
import com.shop.dto.DishPageQueryDTO;
import com.shop.entity.Dish;
import com.shop.entity.DishFlavor;
import com.shop.exception.BaseException;
import com.shop.exception.DeletionNotAllowedException;
import com.shop.mapper.DishFlavorMapper;
import com.shop.mapper.DishMapper;
import com.shop.mapper.SetmealDishMapper;
import com.shop.result.PageResult;
import com.shop.service.DishService;
import com.shop.vo.DishVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class DishServiceImpl implements DishService {
    @Autowired
    DishMapper dishMapper;

    @Autowired
    DishFlavorMapper dishFlavorMapper;

    @Autowired
    SetmealDishMapper setmealDishMapper;

    /**
     * 根据 id 查询菜品和关联的口味数据
     *
     * @param id
     * @return
     */
    @Override
    public DishVO getByIdWithFlavor(Long id) {
        // 查询菜品表
        Dish dish = dishMapper.getById(id);
        if (dish == null) {
            throw new BaseException("菜品不存在");
        }
        // 查询关联的口味
        List<DishFlavor> flavors = dishFlavorMapper.getByDishId(id);
        DishVO dishVO = new DishVO();
        BeanUtils.copyProperties(dish, dishVO);
        dishVO.setFlavors(flavors);
        return dishVO;
    }

    /**
     * 根据分类id查询菜品
     *
     * @param categoryId
     * @return
     */
    @Override
    public List<Dish> getByCategoryId(Long categoryId) {
        Dish dish = Dish.builder()
                .categoryId(categoryId)
                .status(StatusConstant.ENABLE)
                .build();
        return dishMapper.selectList(dish);
    }

    /**
     * 条件查询菜品和口味
     *
     * @param dish
     * @return
     */
    public List<DishVO> listWithFlavor(Dish dish) {
        List<Dish> dishList = dishMapper.selectList(dish);

        List<DishVO> dishVOList = new ArrayList<>();

        for (Dish d : dishList) {
            DishVO dishVO = new DishVO();
            BeanUtils.copyProperties(d, dishVO);

            //根据菜品id查询对应的口味
            List<DishFlavor> flavors = dishFlavorMapper.getByDishId(d.getId());

            dishVO.setFlavors(flavors);
            dishVOList.add(dishVO);
        }

        return dishVOList;
    }

    /**
     * 菜品分页查询
     *
     * @param dishPageQueryDTO
     * @return
     */
    @Override
    public PageResult<DishVO> pageQuery(DishPageQueryDTO dishPageQueryDTO) {
        PageHelper.startPage(dishPageQueryDTO.getPageNum(), dishPageQueryDTO.getPageSize());
        Page<DishVO> page = dishMapper.pageQuery(dishPageQueryDTO);
        return new PageResult<>(page.getTotal(), page.getResult());
    }

    /**
     * 新增菜品
     *
     * @param dishDTO
     */
    @Transactional
    @Override
    public void addWithFlavor(DishDTO dishDTO) {

        Dish dish = new Dish();
        BeanUtils.copyProperties(dishDTO, dish);
        dishMapper.insert(dish);

        // 获取insert语句生成的主键值
        Long dishId = dish.getId();

        List<DishFlavor> flavors = dishDTO.getFlavors();
        if (flavors == null || flavors.isEmpty()) {
            return;
        }
        for (DishFlavor dishFlavor : flavors) {
            dishFlavor.setDishId(dishId);
        }

        dishFlavorMapper.insertBatch(flavors);
    }

    /**
     * 根据id修改菜品和关联的口味
     *
     * @param dishDTO
     */
    @Transactional
    @Override
    public void updateWithFlavor(DishDTO dishDTO) {
        Dish dish = new Dish();
        BeanUtils.copyProperties(dishDTO, dish);
        dishMapper.update(dish);

        Long dishId = dishDTO.getId();
        // 无论是否提交新口味，都先删除旧口味，避免清空口味时残留
        dishFlavorMapper.deleteBatch(List.of(dishId));

        List<DishFlavor> flavors = dishDTO.getFlavors();
        if (flavors == null || flavors.isEmpty()) {
            return;
        }
        for (DishFlavor dishFlavor : flavors) {
            dishFlavor.setDishId(dishId);
        }
        dishFlavorMapper.insertBatch(flavors);
    }

    /**
     * 菜品在售、停售
     *
     * @param status
     * @param id
     */
    @Override
    public void updateStatus(Integer status, Long id) {
        Dish dish = Dish.builder()
                .id(id)
                .status(status)
                .build();
        dishMapper.update(dish);
    }

    /**
     * 批量删除菜品
     *
     * @param ids
     */
    @Transactional
    @Override
    public void deleteBatch(List<Long> ids) {
        // 存在在售中的菜品不能删除
        Integer count = dishMapper.countOnSaleById(ids);
        if (count > 0) {
            throw new DeletionNotAllowedException(MessageConstant.DISH_ON_SALE);
        }
        // 被套餐关联的菜品不能删除
        count = setmealDishMapper.countByDishId(ids);
        if (count > 0) {
            throw new DeletionNotAllowedException(MessageConstant.DISH_BE_RELATED_BY_SETMEAL);
        }

        // 删除菜品表中的菜品数据
        dishMapper.deleteBatch(ids);
        // 删除菜品关联的口味数据
        dishFlavorMapper.deleteBatch(ids);
    }
}
