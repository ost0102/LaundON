import { NextResponse } from 'next/server';

import { iotService, MachineNotFoundError, MachineNotRunningError } from '@/lib/services/iot';
import { isVirtualStoreId } from '@/mocks/virtualStores';
import { simulateNetworkDelay } from '@/lib/network';
import type { MachineDetailResponse } from '@/types/machine';

interface RouteParams {
  params: { machineId: string };
}

export async function POST(_request: Request, { params }: RouteParams) {
  await simulateNetworkDelay();

  if (isVirtualStoreId(params.machineId)) {
    return NextResponse.json({ message: '가상 세탁소의 기기는 종료할 수 없습니다.' }, { status: 400 });
  }

  try {
    const machine = await iotService.stopMachine(params.machineId);
    return NextResponse.json<MachineDetailResponse>({ machine });
  } catch (error) {
    if (error instanceof MachineNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error instanceof MachineNotRunningError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    throw error;
  }
}
