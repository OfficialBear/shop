package com.shop.service;

import com.shop.entity.DataDictionary;

public interface DataDictionaryService {

    DataDictionary get(String dicParentCode, String dicCode);

    void update(DataDictionary dataDictionary);
}
