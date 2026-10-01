import { NextResponse } from 'next/server';

import { findMockStore } from '@/mocks/stores';
import { findVirtualStore, isVirtualStoreId } from '@/mocks/virtualStores';
import { simulateNetworkDelay } from '@/lib/network';
import type { StoreDetailResponse } from '@/types/store';

interface RouteParams {
  params: { storeId: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  await simulateNetworkDelay();

  const store = isVirtualStoreId(params.storeId)
    ? findVirtualStore(params.storeId)
    : findMockStore(params.storeId);

  if (!store) {
    return NextResponse.json({ message: '세탁소를 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json<StoreDetailResponse>({ store });
}
