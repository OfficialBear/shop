export interface SearchParams {
  name?: string;
  categoryId?: number;
  status?: number;
}

// 表单里用的结构
export interface FlavorFormItem {
  name?: string;
  value?: string[];
}

// 表单整体值类型
export interface DishFormValues {
  id?: number;
  name?: string;
  categoryId?: number;
  price?: number;
  image?: string;
  description?: string;
  status?: number;
  flavors?: FlavorFormItem[];
}
