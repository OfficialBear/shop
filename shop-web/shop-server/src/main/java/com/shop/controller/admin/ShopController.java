package com.shop.controller.admin;

import com.shop.constant.DictionaryConstant;
import com.shop.entity.DataDictionary;
import com.shop.result.Result;
import com.shop.service.DataDictionaryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 店铺操作相关接口
 */
@RestController("adminShopController")
@RequestMapping("/admin/shop")
@Slf4j
public class ShopController {

    @Autowired
    private DataDictionaryService dataDictionaryService;

    /**
     * 查询店铺营业状态
     *
     * @return
     */
    @GetMapping("/status")
    public Result<Integer> getStatus() {
        DataDictionary dataDictionary = dataDictionaryService.get(DictionaryConstant.SHOP, DictionaryConstant.SHOP_STATUS);
        Integer status = Integer.parseInt(dataDictionary.getDicValue());
        return Result.success(status);
    }

    /**
     * 设置店铺营业状态
     *
     * @param status
     * @return
     */
    @PutMapping("/{status}")
    public Result<String> setStatus(@PathVariable Integer status) {
        if (status != 0 && status != 1) {
            return Result.error("非法状态值");
        }
        log.info("设置营业状态为：{}", status == 1 ? "营业中" : "打烊中");
        DataDictionary dataDictionary = DataDictionary.builder()
                .dicParentCode(DictionaryConstant.SHOP)
                .dicCode(DictionaryConstant.SHOP_STATUS)
                .dicValue(String.valueOf(status))
                .build();
        dataDictionaryService.update(dataDictionary);

        return Result.success();
    }

}
