package com.shop.mapper;

import com.shop.entity.User;
import com.shop.vo.UserReportVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface UserMapper {


    User getByOpenId(String openid);

    /**
     * 根据 id 查询用户
     *
     * @param id
     * @return
     */
    User getById(Long id);

    /**
     * 插入数据
     *
     * @param user
     */
    void insert(User user);

    /**
     * 统计区间内每日新增用户数量（单条 SQL 聚合，仅返回有数据的日期）
     *
     * @param begin        起始时间（含）
     * @param endExclusive 结束时间（不含）
     * @return 每日新增用户列表
     */
    List<UserReportVO> countNewUsersGroupByDay(@Param("begin") LocalDateTime begin,
                                               @Param("endExclusive") LocalDateTime endExclusive);

    /**
     * 统计指定时间之前的存量用户数量
     *
     * @param begin 时间上界（不含）
     * @return 存量用户数
     */
    Integer countUsersBefore(@Param("begin") LocalDateTime begin);
}
