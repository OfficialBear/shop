package com.shop.controller.admin;

import com.shop.constant.MessageConstant;
import com.shop.result.Result;
import com.shop.utils.AliOssUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

/**
 * 通用接口
 */
@RestController
@RequestMapping("admin/common")
@Slf4j
public class CommonController {

    private static final long MAX_IMAGE_SIZE = 2 * 1024 * 1024L;

    @Autowired
    private AliOssUtil aliOssUtil;

    /**
     * 文件上传
     *
     * @param file
     * @return
     */
    @PostMapping("/upload")
    public Result<String> upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Result.error("上传文件不能为空");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return Result.error("仅支持上传图片文件");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            return Result.error("图片大小不能超过 2MB");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null) {
            int dot = originalFilename.lastIndexOf('.');
            if (dot >= 0) {
                extension = originalFilename.substring(dot);
            }
        }
        String objectName = UUID.randomUUID() + extension;
        log.info("文件上传：{}", objectName);

        try {
            String filePath = aliOssUtil.upload(file.getBytes(), objectName);
            return Result.success(filePath);
        } catch (IOException ex) {
            log.error("文件上传失败", ex);
            return Result.error(MessageConstant.UPLOAD_FAILED);
        }
    }
}
