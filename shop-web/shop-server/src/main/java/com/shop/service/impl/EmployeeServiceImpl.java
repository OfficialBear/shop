package com.shop.service.impl;

import com.shop.constant.MessageConstant;
import com.shop.constant.StatusConstant;
import com.shop.dto.EmployeeLoginDTO;
import com.shop.entity.Employee;
import com.shop.exception.AccountLockedException;
import com.shop.exception.AccountNotFoundException;
import com.shop.exception.PasswordErrorException;
import com.shop.mapper.EmployeeMapper;
import com.shop.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Objects;

@Service
public class EmployeeServiceImpl implements EmployeeService {
    @Autowired
    private EmployeeMapper employeeMapper;

    /**
     * 员工登录
     *
     * @param employeeLoginDTO
     * @return
     */
    @Override
    public Employee login(EmployeeLoginDTO employeeLoginDTO) {
        String username = employeeLoginDTO.getUsername();
        String password = employeeLoginDTO.getPassword();

        //1、根据用户名查询数据库中的数据
        Employee employee = employeeMapper.getByUsername(username);

        //2、处理各种异常情况（用户名不存在、密码不对、账号被锁定）
        if (employee == null) {
            //账号不存在
            throw new AccountNotFoundException(MessageConstant.ACCOUNT_NOT_FOUND);
        }

        // 进行md5加密，然后再进行比对
        String encryptedPassword = DigestUtils.md5DigestAsHex(
                password.getBytes(StandardCharsets.UTF_8)
        );
        if (!Objects.equals(encryptedPassword, employee.getPassword())) {
            //密码错误
            throw new PasswordErrorException(MessageConstant.PASSWORD_ERROR);
        }

        if (Objects.equals(employee.getStatus(), StatusConstant.DISABLE)) {
            //账号被锁定
            throw new AccountLockedException(MessageConstant.ACCOUNT_LOCKED);
        }

        //3、返回实体对象
        return employee;
    }
}

