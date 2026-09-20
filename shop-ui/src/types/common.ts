// 统一响应
export interface Result<T = void> {
  code: number;
  msg: string;
  data: T;
}

// 分页请求参数
export interface PageParams {
  pageNum: number;
  pageSize: number;
}

// 分页响应
export interface PageResult<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}