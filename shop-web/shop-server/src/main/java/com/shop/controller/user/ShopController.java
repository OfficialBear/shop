package com.shop.controller.user;

import com.shop.constant.DictionaryConstant;
import com.shop.entity.DataDictionary;
import com.shop.result.Result;
import com.shop.service.DataDictionaryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 店铺操作相关接口
 */
@RestController("userShopController")
@RequestMapping("/user/shop")
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
}
