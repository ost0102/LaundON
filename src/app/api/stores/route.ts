import { NextResponse } from 'next/server';

import { getMockMachinesByStore } from '@/mocks/machines';
import { MOCK_STORES } from '@/mocks/stores';
import { generateNearbyStores } from '@/mocks/virtualStores';
import { simulateNetworkDelay } from '@/lib/network';
import type { StoreListResponse } from '@/types/store';

function parseCoordinate(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  await simulateNetworkDelay();

  const { searchParams } = new URL(request.url);
  const lat = parseCoordinate(searchParams.get('lat'));
  const lng = parseCoordinate(searchParams.get('lng'));

  if (lat !== null && lng !== null) {
    const stores = generateNearbyStores({ lat, lng });
    return NextResponse.json<StoreListResponse>({ stores });
  }

  const stores: StoreListResponse['stores'] = MOCK_STORES.map((store) => {
    const machines = getMockMachinesByStore(store.id);
    const washers = machines.filter((machine) => machine.type === 'WASHER');
    const dryers = machines.filter((machine) => machine.type === 'DRYER');

    return {
      ...store,
      washerAvailableCount: washers.filter((machine) => machine.status === 'AVAILABLE').length,
      washerTotalCount: washers.length,
      dryerAvailableCount: dryers.filter((machine) => machine.status === 'AVAILABLE').length,
      dryerTotalCount: dryers.length,
    };
  });

  return NextResponse.json<StoreListResponse>({ stores });
}
