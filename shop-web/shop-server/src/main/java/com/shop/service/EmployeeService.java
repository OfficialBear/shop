package com.shop.service;

import com.shop.dto.EmployeeDTO;
import com.shop.dto.EmployeeLoginDTO;
import com.shop.dto.EmployeePageQueryDTO;
import com.shop.entity.Employee;
import com.shop.result.PageResult;

public interface EmployeeService {

    /**
     * 员工登录
     *
     * @param employeeLoginDTO
     * @return
     */
    Employee login(EmployeeLoginDTO employeeLoginDTO);

    /**
     * 新增员工
     *
     * @param employeeDTO
     */
    void save(EmployeeDTO employeeDTO);

    /**
     * 员工分页查询
     *
     * @param employeePageQueryDTO
     * @return
     */
    PageResult pageQuery(EmployeePageQueryDTO employeePageQueryDTO);
}
