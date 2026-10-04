package com.shop.controller.notify;

import com.shop.pay.WechatPayService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 微信支付回调（服务器对服务器，无用户登录态）。
 */
@RestController
@RequestMapping("/pay/wechat")
@Slf4j
public class PayNotifyController {

    @Autowired
    private WechatPayService wechatPayService;

    @PostMapping("/notify")
    public ResponseEntity<Map<String, String>> notify(
            @RequestHeader("Wechatpay-Timestamp") String timestamp,
            @RequestHeader("Wechatpay-Nonce") String nonce,
            @RequestHeader("Wechatpay-Signature") String signature,
            @RequestHeader("Wechatpay-Serial") String serial,
            @RequestBody String body
    ) {
        Map<String, String> result = new HashMap<>();
        try {
            wechatPayService.handleNotify(timestamp, nonce, signature, serial, body);
            result.put("code", "SUCCESS");
            result.put("message", "成功");
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            log.error("微信支付回调处理失败", ex);
            result.put("code", "FAIL");
            result.put("message", ex.getMessage() == null ? "处理失败" : ex.getMessage());
            // 返回非 2xx 让微信按策略重试
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }
}
