import { apiGet } from '@/services/apiClient';
import type { MachineType } from '@/types/machine';
import type { LaundryProgram, ProgramListResponse } from '@/types/program';

export async function getPrograms(storeId: string, type: MachineType): Promise<LaundryProgram[]> {
  const data = await apiGet<ProgramListResponse>(
    `/api/stores/${storeId}/programs?type=${type}`,
  );
  return data.programs;
}
