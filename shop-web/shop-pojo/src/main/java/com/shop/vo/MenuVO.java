package com.shop.vo;

import com.shop.dto.MenuItemDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuVO implements Serializable {

    // 分类id
    private Long id;

    // 分类名称
    private String name;

    List<MenuItemDTO> items = new ArrayList<>();

}
