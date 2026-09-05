package com.shop.service;

import com.shop.dto.EmployeeDTO;
import com.shop.dto.EmployeeLoginDTO;
import com.shop.entity.Employee;

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
}
