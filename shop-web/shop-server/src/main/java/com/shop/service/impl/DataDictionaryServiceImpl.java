package com.shop.service.impl;

import com.shop.context.BaseContext;
import com.shop.entity.DataDictionary;
import com.shop.mapper.DataDictionaryMapper;
import com.shop.service.DataDictionaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DataDictionaryServiceImpl implements DataDictionaryService {
    @Autowired
    private DataDictionaryMapper dataDictionaryMapper;

    @Override
    public DataDictionary get(String dicParentCode, String dicCode) {
        return dataDictionaryMapper.select(dicParentCode, dicCode);
    }

    @Override
    public void update(DataDictionary dataDictionary) {
        dataDictionary.setUpdateUser(BaseContext.getCurrentId());
        dataDictionaryMapper.update(dataDictionary);
    }
}
