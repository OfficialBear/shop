package com.shop.mapper;

import com.shop.entity.DataDictionary;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DataDictionaryMapper {
    DataDictionary select(String dicParentCode, String dicCode);

    void update(DataDictionary dataDictionary);
}
