export interface DishFlavor {
  id?: number;
  // 菜品id
  dishId?: number;
  // 口味名称
  name?: string;
  // 口味数据list
  value?: string;
}

export interface Dish {
  id: number;
  name: string;
  categoryId: number;
  price: number;
  image: string;
  description: string;
  status: number;
  flavors: DishFlavor[];
  categoryName: string;
  updateTime: string;
}
