import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db/prisma';
import { isVirtualStoreId } from '@/mocks/virtualStores';
import { simulateNetworkDelay } from '@/lib/network';
import type { ProgramListResponse } from '@/types/program';

interface RouteParams {
  params: { storeId: string };
}

/** Course options a user can pick from before starting a machine - public, read-only. */
export async function GET(request: Request, { params }: RouteParams) {
  await simulateNetworkDelay();

  if (isVirtualStoreId(params.storeId)) {
    return NextResponse.json<ProgramListResponse>({ programs: [] });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  if (type !== 'WASHER' && type !== 'DRYER') {
    return NextResponse.json({ message: 'type은 WASHER 또는 DRYER여야 합니다.' }, { status: 400 });
  }

  const programs = await prisma.laundryProgram.findMany({
    where: { laundromatId: params.storeId, machineType: type },
    orderBy: { price: 'asc' },
    select: { id: true, name: true, durationMinutes: true, price: true },
  });

  return NextResponse.json<ProgramListResponse>({ programs });
}
