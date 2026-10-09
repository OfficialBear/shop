package com.shop.controller.admin;

import com.shop.auth.LoginUser;
import com.shop.constant.JwtClaimsConstant;
import com.shop.context.UserContext;
import com.shop.dto.EmployeeDTO;
import com.shop.dto.EmployeeEditPasswordDTO;
import com.shop.dto.EmployeeLoginDTO;
import com.shop.dto.EmployeePageQueryDTO;
import com.shop.entity.Employee;
import com.shop.properties.JwtProperties;
import com.shop.result.PageResult;
import com.shop.result.Result;
import com.shop.service.EmployeeService;
import com.shop.utils.JwtUtil;
import com.shop.vo.EmployeeLoginVO;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 员工管理
 */
@RestController
@RequestMapping("/admin/employee")
@Slf4j
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private JwtProperties jwtProperties;

    /**
     * 登录
     *
     * @param employeeLoginDTO
     * @return
     */
    @PostMapping("/login")
    public Result<EmployeeLoginVO> login(@RequestBody EmployeeLoginDTO employeeLoginDTO,
                                         HttpServletResponse response) {
        log.info("员工登录：{}", employeeLoginDTO);

        Employee employee = employeeService.login(employeeLoginDTO);

        //登录成功后，生成jwt令牌
        Map<String, Object> claims = new HashMap<>();
        claims.put(JwtClaimsConstant.EMP_ID, employee.getId());
        claims.put(JwtClaimsConstant.USERNAME, employee.getUsername());
        String token = JwtUtil.generateToken(
                jwtProperties.getAdminSecretKey(),
                claims,
                jwtProperties.getAdminTtl());

        // 通过 HttpOnly Cookie 下发令牌，前端 JS 不可读取，降低 XSS 窃取风险
        writeTokenCookie(response, token);

        EmployeeLoginVO employeeLoginVO = EmployeeLoginVO.builder()
                .id(employee.getId())
                .userName(employee.getUsername())
                .name(employee.getName())
                .build();

        return Result.success(employeeLoginVO);
    }

    /**
     * 退出
     *
     * @return
     */
    @PostMapping("/logout")
    public Result<String> logout(HttpServletResponse response) {
        clearTokenCookie(response);
        return Result.success();
    }

    @GetMapping("/current")
    public Result<LoginUser> getCurrentUser() {
        return Result.success(UserContext.getCurrentUser());
    }

    /**
     * 修改当前登录员工密码
     *
     * @param employeeEditPasswordDTO
     * @return
     */
    @PutMapping("/password")
    public Result<String> editPassword(@RequestBody EmployeeEditPasswordDTO employeeEditPasswordDTO) {
        log.info("修改当前登录员工密码, 员工id {}", UserContext.getCurrentUser().getUserId());
        employeeService.editPassword(employeeEditPasswordDTO);
        return Result.success();
    }

    /**
     * 员工分页查询
     *
     * @param employeePageQueryDTO
     * @return
     */
    @GetMapping("page")
    public Result<PageResult<Employee>> page(EmployeePageQueryDTO employeePageQueryDTO) {
        log.info("员工分页查询: {}", employeePageQueryDTO);
        PageResult<Employee> pageResult = employeeService.pageQuery(employeePageQueryDTO);
        return Result.success(pageResult);
    }

    /**
     * 新增员工
     *
     * @param employeeDTO
     * @return
     */
    @PostMapping
    public Result add(@RequestBody EmployeeDTO employeeDTO) {
        log.info("新增员工: {}", employeeDTO);
        employeeService.add(employeeDTO);
        return Result.success();
    }

    /**
     * 编辑员工信息
     *
     * @param employeeDTO
     * @return
     */
    @PutMapping
    public Result<String> update(@RequestBody EmployeeDTO employeeDTO) {
        log.info("编辑员工: {}", employeeDTO);
        employeeService.update(employeeDTO);
        return Result.success();
    }

    /**
     * 启用/禁用员工账号
     *
     * @param status
     * @param id
     * @return
     */
    @PutMapping("/status/{status}")
    public Result<String> updateStatus(@PathVariable Integer status, @RequestParam Long id) {
        log.info("启用/禁用员工账号: {}, {}", status, id);
        employeeService.updateStatus(status, id);
        return Result.success();
    }

    /**
     * 批量删除员工
     *
     * @param ids
     * @return
     */
    @DeleteMapping
    public Result<String> deleteBatch(@RequestBody List<Long> ids) {
        log.info("批量删除员工: {}", ids);
        employeeService.deleteBatch(ids);
        return Result.success();
    }

    /**
     * 下发 JWT Cookie（HttpOnly，前端 JS 不可读取）。
     */
    private void writeTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie
                .from(jwtProperties.getAdminTokenName(), token)
                .httpOnly(true)
                .secure(jwtProperties.isAdminCookieSecure())
                .path("/")
                .sameSite("Lax")
                .maxAge(jwtProperties.getAdminTtl() / 1000)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    /**
     * 清除 JWT Cookie。
     */
    private void clearTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie
                .from(jwtProperties.getAdminTokenName(), "")
                .httpOnly(true)
                .secure(jwtProperties.isAdminCookieSecure())
                .path("/")
                .sameSite("Lax")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
