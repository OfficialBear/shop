import type { PageParams, PageResult } from '@/types';
import { useMemoizedFn, useRequest } from 'ahooks';
import type { FormInstance, TableProps } from 'antd';
import type { Key } from 'react';
import { useState } from 'react';

interface UseTablePageOptions<T, S> {
  /** 分页查询接口，如 `getPage` */
  fetch: (params: S & PageParams) => Promise<PageResult<T>>;
  /** 搜索表单实例，用于重置；不传则 reset 只清空查询参数 */
  form?: FormInstance<S>;
  defaultPageSize?: number;
}

/**
 * 列表页通用逻辑：分页查询、搜索、翻页、行选择、刷新。
 * 让各 CRUD 页面只关注列定义与弹窗表单。
 */
export function useTablePage<T, S extends object>(
  options: UseTablePageOptions<T, S>,
) {
  const { fetch, form, defaultPageSize = 10 } = options;

  const [searchParams, setSearchParams] = useState<S>({} as S);
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: defaultPageSize,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const { data, loading, refresh } = useRequest(
    () => fetch({ ...searchParams, ...pagination }),
    {
      refreshDeps: [searchParams, pagination.pageNum, pagination.pageSize],
      // 每次查询后清空选择，避免跨页残留
      onSuccess: () => setSelectedRowKeys([]),
    },
  );

  const search = useMemoizedFn((values: S) => {
    setSearchParams(values);
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
  });

  const reset = useMemoizedFn(() => {
    form?.resetFields();
    setSearchParams({} as S);
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
  });

  const changePage = useMemoizedFn((pageNum: number, pageSize: number) => {
    setPagination({ pageNum, pageSize });
  });

  const reload = useMemoizedFn(async () => {
    try {
      await refresh();
    } catch {
      // 错误提示由全局请求层统一处理
    }
  });

  const rowSelection: TableProps<T>['rowSelection'] = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  return {
    data: data?.records ?? [],
    total: data?.total ?? 0,
    loading,
    pagination,
    selectedRowKeys,
    rowSelection,
    search,
    reset,
    changePage,
    reload,
    clearSelection: () => setSelectedRowKeys([]),
  };
}
