import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queryKeys';
import { getStore } from '@/services/store.service';

export function useStore(storeId: string) {
  return useQuery({
    queryKey: queryKeys.store(storeId),
    queryFn: () => getStore(storeId),
    enabled: Boolean(storeId),
  });
}
