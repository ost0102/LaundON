import { NextResponse } from 'next/server';

import { findMockStore } from '@/mocks/stores';
import { getMockMachinesByStore } from '@/mocks/machines';
import { findVirtualStore, getVirtualStoreMachines, isVirtualStoreId } from '@/mocks/virtualStores';
import { simulateNetworkDelay } from '@/lib/network';
import type { MachineListResponse } from '@/types/machine';

interface RouteParams {
  params: { storeId: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  await simulateNetworkDelay();

  if (isVirtualStoreId(params.storeId)) {
    const store = findVirtualStore(params.storeId);
    if (!store) {
      return NextResponse.json({ message: '세탁소를 찾을 수 없습니다.' }, { status: 404 });
    }
    const machines = getVirtualStoreMachines(params.storeId) ?? [];
    return NextResponse.json<MachineListResponse>({ machines });
  }

  const store = findMockStore(params.storeId);

  if (!store) {
    return NextResponse.json({ message: '세탁소를 찾을 수 없습니다.' }, { status: 404 });
  }

  const machines = getMockMachinesByStore(params.storeId);

  return NextResponse.json<MachineListResponse>({ machines });
}
