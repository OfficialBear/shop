package com.shop.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.shop.constant.MessageConstant;
import com.shop.constant.StatusConstant;
import com.shop.dto.SetmealDTO;
import com.shop.dto.SetmealPageQueryDTO;
import com.shop.entity.Setmeal;
import com.shop.entity.SetmealDish;
import com.shop.exception.DeletionNotAllowedException;
import com.shop.mapper.SetmealDishMapper;
import com.shop.mapper.SetmealMapper;
import com.shop.result.PageResult;
import com.shop.service.SetmealService;
import com.shop.vo.DishItemVO;
import com.shop.vo.SetmealVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 套餐业务实现
 */
@Service
@Slf4j
public class SetmealServiceImpl implements SetmealService {
    @Autowired
    private SetmealMapper setmealMapper;

    @Autowired
    private SetmealDishMapper setmealDishMapper;

    @Override
    public PageResult pageQuery(SetmealPageQueryDTO setmealPageQueryDTO) {
        PageHelper.startPage(setmealPageQueryDTO.getPageNum(), setmealPageQueryDTO.getPageSize());

        Page<Setmeal> page = setmealMapper.pageQuery(setmealPageQueryDTO);

        return new PageResult(page.getTotal(), page.getResult());
    }

    @Override
    public SetmealVO getBySetmealId(Long id) {
        SetmealVO setmealVO = setmealMapper.getBySetmealId(id);
        List<SetmealDish> setmealDishes = setmealDishMapper.getBySetmealId(id);
        setmealVO.setSetmealDishes(setmealDishes);
        return setmealVO;
    }

    /**
     * 条件查询
     *
     * @param setmeal
     * @return
     */
    @Override
    public List<Setmeal> list(Setmeal setmeal) {
        List<Setmeal> list = setmealMapper.selectList(setmeal);
        return list;
    }

    /**
     * 根据id查询菜品选项
     *
     * @param id
     * @return
     */
    @Override
    public List<DishItemVO> getDishItemById(Long id) {
        return setmealDishMapper.getDishItemBySetmealId(id);
    }

    /**
     * 新增套餐，同时需要保存套餐和菜品的关联关系
     *
     * @param setmealDTO
     */
    @Override
    public void add(SetmealDTO setmealDTO) {
        Setmeal setmeal = new Setmeal();
        BeanUtils.copyProperties(setmealDTO, setmeal);
        setmeal.setStatus(StatusConstant.DISABLE);
        setmealMapper.insert(setmeal);
        List<SetmealDish> list = setmealDTO.getSetmealDishes();
        if (list != null && list.size() > 0) {
            for (SetmealDish sd : list) {
                sd.setSetmealId(setmeal.getId());
            }
            // 保存套餐和菜品的关联关系
            setmealDishMapper.insertBatch(list);
        }
    }

    @Transactional
    @Override
    public void update(SetmealDTO setmealDTO) {
        Setmeal setmeal = new Setmeal();
        BeanUtils.copyProperties(setmealDTO, setmeal);
        setmealMapper.update(setmeal);

        List<Long> ids = new ArrayList<>();
        ids.add(setmealDTO.getId());
        setmealDishMapper.deleteBatch(ids);

        List<SetmealDish> list = setmealDTO.getSetmealDishes();
        if (list != null && list.size() > 0) {
            setmealDishMapper.insertBatch(list);
        }
    }

    @Override
    public void updateStatus(Integer status, Long id) {
        Setmeal setmeal = Setmeal.builder()
                .id(id)
                .status(status)
                .build();
        setmealMapper.update(setmeal);
    }

    @Transactional
    @Override
    public void deleteBatch(List<Long> ids) {
        Integer count = setmealDishMapper.countEnabledBySetmealId(ids);
        if (count > 0) {
            throw new DeletionNotAllowedException(MessageConstant.SETMEAL_ON_SALE);
        }
        setmealDishMapper.deleteBatch(ids);
        setmealMapper.deleteBatch(ids);
    }
}
