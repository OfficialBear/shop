package com.shop.mapper;

import com.shop.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {


    User getByOpenId(String openid);

    /**
     * 插入数据
     *
     * @param user
     */
    void insert(User user);
}
