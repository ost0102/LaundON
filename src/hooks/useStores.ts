import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queryKeys';
import { getStores } from '@/services/store.service';
import type { Coordinates } from '@/lib/geo';

export function useStores(coords?: Coordinates) {
  return useQuery({
    queryKey: queryKeys.stores(coords),
    queryFn: () => getStores(coords),
    refetchInterval: 5000,
  });
}
