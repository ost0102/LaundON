import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queryKeys';
import { getMachines } from '@/services/machine.service';

/**
 * Polls the IoT-backed machine list every 5s. The swap to a push-based
 * transport (WebSocket/SSE) later only touches this hook - consuming
 * components just read `data` regardless of how it gets refreshed.
 */
export function useMachines(storeId: string) {
  return useQuery({
    queryKey: queryKeys.machines(storeId),
    queryFn: () => getMachines(storeId),
    enabled: Boolean(storeId),
    refetchInterval: 5000,
  });
}
