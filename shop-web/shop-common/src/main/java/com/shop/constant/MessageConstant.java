package com.shop.constant;

/**
 * 信息提示常量类
 */
public class MessageConstant {

    public static final String PASSWORD_ERROR = "密码错误";
    public static final String OLD_PASSWORD_ERROR = "原密码错误";
    public static final String PASSWORD_CANNOT_BE_EMPTY = "原密码和新密码不能为空";
    public static final String PASSWORD_FORMAT_ERROR = "密码长度需为 6-20 位";
    public static final String NEW_PASSWORD_SAME_AS_OLD = "新密码不能与原密码相同";
    public static final String ACCOUNT_NOT_FOUND = "账号不存在";
    public static final String ACCOUNT_LOCKED = "账号被锁定";
    public static final String ALREADY_EXISTS = "已经存在";
    public static final String UNKNOWN_ERROR = "未知错误";

    public static final String CATEGORY_BE_RELATED_BY_SETMEAL = "当前分类关联了套餐,不能删除";
    public static final String CATEGORY_BE_RELATED_BY_DISH = "当前分类关联了菜品,不能删除";
    public static final String DISH_ON_SALE = "在售中的菜品不能删除";
    public static final String DISH_BE_RELATED_BY_SETMEAL = "当前菜品关联了套餐,不能删除";

    public static final String UPLOAD_FAILED = "文件上传失败";

    public static final String LOGIN_FAILED = "登录失败";

    public static final String SETMEAL_ON_SALE = "起售中的套餐不能删除";

    public static final String ORDER_STATUS_ERROR = "订单状态错误";
    public static final String ORDER_NOT_FOUND = "订单不存在";
}
