package com.shop.service.impl;

import com.alibaba.fastjson2.JSONObject;
import com.shop.constant.MessageConstant;
import com.shop.dto.UserLoginDTO;
import com.shop.entity.User;
import com.shop.exception.LoginFailedException;
import com.shop.mapper.UserMapper;
import com.shop.properties.WechatProperties;
import com.shop.service.UserService;
import com.shop.utils.HttpClientUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    private static String WX_LOGIN_URL = "https://api.weixin.qq.com/sns/jscode2session";

    @Autowired
    private HttpClientUtil httpClientUtil;

    @Autowired
    private WechatProperties wechatProperties;

    @Autowired
    private UserMapper userMapper;

    /**
     * 根据微信授权码实现登录
     *
     * @param userLoginDTO
     * @return
     */
    @Override
    public User wxLogin(UserLoginDTO userLoginDTO) {
        String openid = getOpenId(userLoginDTO.getCode());
        if (openid == null) {
            throw new LoginFailedException(MessageConstant.LOGIN_FAILED);
        }
        User user = userMapper.getByOpenId(openid);
        if (user == null) {
            // 新用户，自动完成注册
            user = User.builder()
                    .openid(openid)
                    .createTime(LocalDateTime.now())
                    .build();
            userMapper.insert(user);
        }
        return user;
    }

    private String getOpenId(String code) {
        Map<String, String> queryParams = new HashMap<>();
        queryParams.put("appid", wechatProperties.getAppid());
        queryParams.put("secret", wechatProperties.getSecret());
        queryParams.put("js_code", code);
        queryParams.put("grant_type", "authorization_code");
        String json = httpClientUtil.get(WX_LOGIN_URL, null, queryParams);
        System.out.println(json);
        JSONObject body = JSONObject.parseObject(json);
        return body.getString("openid");
    }
}
