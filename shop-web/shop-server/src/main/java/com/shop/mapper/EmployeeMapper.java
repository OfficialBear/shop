package com.shop.mapper;

import com.github.pagehelper.Page;
import com.shop.dto.EmployeePageQueryDTO;
import com.shop.entity.Employee;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EmployeeMapper {

    /**
     * 根据用户名查询员工
     *
     * @param username
     * @return
     */
    Employee getByUsername(String username);

    /**
     * 插入数据
     *
     * @param employee
     */
    void insert(Employee employee);

    /**
     * 员工分页查询
     *
     * @param employeePageQueryDTO
     * @return
     */
    Page<Employee> pageQuery(EmployeePageQueryDTO employeePageQueryDTO);
}

