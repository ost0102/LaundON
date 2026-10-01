import { NextResponse } from 'next/server';

import { getMockMachineById } from '@/mocks/machines';
import { getVirtualMachineById, isVirtualStoreId } from '@/mocks/virtualStores';
import { simulateNetworkDelay } from '@/lib/network';
import type { MachineDetailResponse } from '@/types/machine';

interface RouteParams {
  params: { machineId: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  await simulateNetworkDelay();

  const machine = isVirtualStoreId(params.machineId)
    ? getVirtualMachineById(params.machineId)
    : getMockMachineById(params.machineId);

  if (!machine) {
    return NextResponse.json({ message: '기기를 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json<MachineDetailResponse>({ machine });
}
