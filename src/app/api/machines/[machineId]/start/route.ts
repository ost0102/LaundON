import { NextResponse } from 'next/server';

import { iotService, MachineNotAvailableError, MachineNotFoundError, ProgramNotFoundError } from '@/lib/services/iot';
import { isVirtualStoreId } from '@/mocks/virtualStores';
import { simulateNetworkDelay } from '@/lib/network';
import type { MachineDetailResponse } from '@/types/machine';

interface RouteParams {
  params: { machineId: string };
}

export async function POST(request: Request, { params }: RouteParams) {
  await simulateNetworkDelay();

  if (isVirtualStoreId(params.machineId)) {
    return NextResponse.json({ message: '가상 세탁소의 기기는 시작할 수 없습니다.' }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { programId?: string } | null;

  try {
    const machine = await iotService.startMachine(params.machineId, body?.programId);
    return NextResponse.json<MachineDetailResponse>({ machine });
  } catch (error) {
    if (error instanceof MachineNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error instanceof MachineNotAvailableError || error instanceof ProgramNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    throw error;
  }
}
