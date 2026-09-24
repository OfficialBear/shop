export interface SetmealDish {
  id?: number;
  setmealId?: number; // 套餐id
  dishId: number; // 菜品id
  name?: string; // 菜品名称
  price?: number; // 菜品原价
  copies: number; // 份数
}

export interface Setmeal {
  id: number;
  name: string; // 套餐名称
  categoryId: number;
  price: number; // 套餐价格
  image: string; // 图片
  description: string; // 描述信息
  status: number; // 状态 0:停用 1:启用
  categoryName: string; // 分类名称
  updateTime: string; // 更新时间
  setmealDishes: SetmealDish[]; // 套餐和菜品的关联关系
}
