import type { Coordinates } from '@/lib/geo';

export const queryKeys = {
  stores: (coords?: Coordinates) => ['stores', coords ?? null] as const,
  store: (storeId: string) => ['store', storeId] as const,
  machines: (storeId: string) => ['machines', storeId] as const,
  machine: (machineId: string) => ['machine', machineId] as const,
};
