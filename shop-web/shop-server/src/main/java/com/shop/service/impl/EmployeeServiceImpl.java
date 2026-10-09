package com.shop.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.shop.auth.LoginUser;
import com.shop.constant.MessageConstant;
import com.shop.constant.PasswordConstant;
import com.shop.constant.StatusConstant;
import com.shop.context.UserContext;
import com.shop.dto.EmployeeDTO;
import com.shop.dto.EmployeeEditPasswordDTO;
import com.shop.dto.EmployeeLoginDTO;
import com.shop.dto.EmployeePageQueryDTO;
import com.shop.entity.Employee;
import com.shop.exception.AccountLockedException;
import com.shop.exception.AccountNotFoundException;
import com.shop.exception.BaseException;
import com.shop.exception.PasswordErrorException;
import com.shop.exception.UniquenessConstraintViolationException;
import com.shop.mapper.EmployeeMapper;
import com.shop.result.PageResult;
import com.shop.service.EmployeeService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;

@Service
public class EmployeeServiceImpl implements EmployeeService {
    @Autowired
    private EmployeeMapper employeeMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

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

        if (employee.getPassword() == null
                || !passwordEncoder.matches(password, employee.getPassword())) {
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

    /**
     * 员工分页查询
     *
     * @param employeePageQueryDTO
     * @return
     */
    @Override
    public PageResult<Employee> pageQuery(EmployeePageQueryDTO employeePageQueryDTO) {
        PageHelper.startPage(employeePageQueryDTO.getPageNum(), employeePageQueryDTO.getPageSize());
        Page<Employee> page = employeeMapper.pageQuery(employeePageQueryDTO);
        List<Employee> employeeList = page.getResult();
        for (Employee employee : employeeList) {
            employee.setPassword(null);
        }
        return new PageResult<>(page.getTotal(), employeeList);
    }

    /**
     * 新增员工
     *
     * @param employeeDTO
     */
    @Override
    public void add(EmployeeDTO employeeDTO) {
        // username 存在唯一约束，检查是否已经存在
        String username = employeeDTO.getUsername();
        Employee employee = employeeMapper.getByUsername(username);
        if (employee != null) {
            throw new UniquenessConstraintViolationException(username + MessageConstant.ALREADY_EXISTS);
        }

        employee = new Employee();
        // 属性拷贝
        BeanUtils.copyProperties(employeeDTO, employee);
        // 账号状态默认为1，正常状态
        employee.setStatus(StatusConstant.ENABLE);
        employee.setPassword(passwordEncoder.encode(PasswordConstant.DEFAULT_PASSWORD));

        employeeMapper.insert(employee);
    }

    /**
     * 编辑员工信息
     *
     * @param employeeDTO
     */
    @Override
    public void update(EmployeeDTO employeeDTO) {
        Employee employee = new Employee();
        BeanUtils.copyProperties(employeeDTO, employee);

        employeeMapper.update(employee);
    }

    /**
     * 启用/禁用员工账号
     *
     * @param status
     * @param id
     */
    @Override
    public void updateStatus(Integer status, Long id) {
        Employee employee = Employee.builder()
                .id(id)
                .status(status)
                .build();
        employeeMapper.update(employee);
    }

    @Override
    public void deleteBatch(List<Long> ids) {
        employeeMapper.deleteBatch(ids);
    }

    @Override
    public void editPassword(EmployeeEditPasswordDTO employeeEditPasswordDTO) {
        if (employeeEditPasswordDTO == null
                || !StringUtils.hasText(employeeEditPasswordDTO.getOldPassword())
                || !StringUtils.hasText(employeeEditPasswordDTO.getNewPassword())) {
            throw new BaseException(MessageConstant.PASSWORD_CANNOT_BE_EMPTY);
        }

        String newPassword = employeeEditPasswordDTO.getNewPassword();
        if (newPassword.length() < 6 || newPassword.length() > 20) {
            throw new BaseException(MessageConstant.PASSWORD_FORMAT_ERROR);
        }

        LoginUser loginUser = UserContext.getCurrentUser();
        if (loginUser == null || loginUser.getUserId() == null) {
            throw new BaseException("未登录");
        }

        Employee employee = employeeMapper.getById(loginUser.getUserId());
        if (employee == null) {
            throw new AccountNotFoundException(MessageConstant.ACCOUNT_NOT_FOUND);
        }

        if (!passwordEncoder.matches(employeeEditPasswordDTO.getOldPassword(), employee.getPassword())) {
            throw new PasswordErrorException(MessageConstant.OLD_PASSWORD_ERROR);
        }

        if (passwordEncoder.matches(newPassword, employee.getPassword())) {
            throw new BaseException(MessageConstant.NEW_PASSWORD_SAME_AS_OLD);
        }

        Employee update = Employee.builder()
                .id(employee.getId())
                .password(passwordEncoder.encode(newPassword))
                .build();
        employeeMapper.update(update);
    }
}

