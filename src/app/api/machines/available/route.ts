import { NextResponse } from 'next/server';

import { iotService } from '@/lib/services/iot';
import { simulateNetworkDelay } from '@/lib/network';
import type { MachineListResponse } from '@/types/machine';

export async function GET(request: Request) {
  await simulateNetworkDelay();

  const { searchParams } = new URL(request.url);
  const laundromatId = searchParams.get('storeId') ?? undefined;

  const machines = await iotService.getAvailableMachines(laundromatId);
  return NextResponse.json<MachineListResponse>({ machines });
}
