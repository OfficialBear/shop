import { getListByType } from '@/services/category';
import type { Category } from '@/types';
import { useRequest } from 'ahooks';

import { useMemo } from 'react';

export function useCategoryOptions(type: number) {
  const { data, loading, refresh } = useRequest(() => getListByType(type), {
    cacheKey: `category-options-${type}`, // 参数进 cacheKey
    staleTime: 5 * 60 * 1000,
  });

  const options = useMemo(
    () =>
      (data ?? []).map((i: Category) => ({
        label: i.name,
        value: String(i.id),
      })),
    [data],
  );

  return { options, loading, refresh };
}
