package com.shop.controller.admin;

import com.shop.dto.SetmealDTO;
import com.shop.dto.SetmealPageQueryDTO;
import com.shop.result.PageResult;
import com.shop.result.Result;
import com.shop.service.SetmealService;
import com.shop.vo.SetmealVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 管理端-套餐相关接口
 */
@RestController("adminSetmealController")
@RequestMapping("/admin/setmeal")
@Slf4j
public class SetmealController {
    @Autowired
    private SetmealService setmealService;

    @GetMapping("/{id}")
    public Result<SetmealVO> getBySetmealId(@PathVariable Long id) {
        SetmealVO setmealVO = setmealService.getBySetmealId(id);
        return Result.success(setmealVO);
    }

    @GetMapping("/page")
    public Result<PageResult> pageQuery(SetmealPageQueryDTO setmealPageQueryDTO) {
        PageResult pageResult = setmealService.pageQuery(setmealPageQueryDTO);
        return Result.success(pageResult);
    }

    @PostMapping
    public Result<String> add(@RequestBody SetmealDTO setmealDTO) {
        setmealService.add(setmealDTO);
        return Result.success();
    }

    @PutMapping
    public Result<String> update(@RequestBody SetmealDTO setmealDTO) {
        setmealService.update(setmealDTO);
        return Result.success();
    }

    /**
     * 套餐起售、停售
     *
     * @param status
     * @param id
     * @return
     */
    @PutMapping("/status/{status}")
    public Result<String> updateStatus(@PathVariable Integer status, Long id) {
        log.info("启用/禁用套餐: {}, {}", status, id);
        setmealService.updateStatus(status, id);
        return Result.success();
    }

    @DeleteMapping
    public Result<String> remove(@RequestBody List<Long> ids) {
        log.info("批量删除套餐: {}", ids);
        setmealService.deleteBatch(ids);
        return Result.success();
    }
}
