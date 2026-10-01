import { apiGet } from '@/services/apiClient';
import type { Machine, MachineDetailResponse, MachineListResponse } from '@/types/machine';

export async function getMachines(storeId: string): Promise<Machine[]> {
  const data = await apiGet<MachineListResponse>(`/api/stores/${storeId}/machines`);
  return data.machines;
}

export async function getMachine(machineId: string): Promise<Machine> {
  const data = await apiGet<MachineDetailResponse>(`/api/machines/${machineId}`);
  return data.machine;
}
