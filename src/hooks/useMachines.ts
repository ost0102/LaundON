import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queryKeys';
import { getMachines, startMachine, stopMachine } from '@/services/machine.service';

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

/** Starts a machine and refreshes that store's machine list once the server confirms it. */
export function useStartMachine(storeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ machineId, programId }: { machineId: string; programId?: string }) =>
      startMachine(machineId, programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.machines(storeId) });
    },
  });
}

/** Stops a machine (frees it back to AVAILABLE) - used by "세탁물 수거 확인". */
export function useStopMachine(storeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (machineId: string) => stopMachine(machineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.machines(storeId) });
    },
  });
}
