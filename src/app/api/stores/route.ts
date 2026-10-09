import { NextResponse } from 'next/server';

import { iotService } from '@/lib/services/iot';
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

  const stores = await iotService.listLaundromats();
  return NextResponse.json<StoreListResponse>({ stores });
}
