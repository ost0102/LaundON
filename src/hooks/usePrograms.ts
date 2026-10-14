import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queryKeys';
import { getPrograms } from '@/services/program.service';
import type { MachineType } from '@/types/machine';

/** Only fetched once the user actually opens a machine's course picker - enabled is caller-controlled. */
export function usePrograms(storeId: string, type: MachineType, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.programs(storeId, type),
    queryFn: () => getPrograms(storeId, type),
    enabled: enabled && Boolean(storeId),
    staleTime: 5 * 60 * 1000,
  });
}
