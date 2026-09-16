package com.shop.service;

import com.shop.dto.UserLoginDTO;
import com.shop.entity.User;

public interface UserService {

    /**
     * 根据微信授权码实现登录
     *
     * @param userLoginDTO
     * @return
     */
    User wxLogin(UserLoginDTO userLoginDTO);
}
