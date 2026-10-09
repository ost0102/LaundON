import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db/prisma';

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const machines = await prisma.machine.findMany({
    where: { laundromatId: params.id },
    include: { program: { select: { id: true, name: true } } },
    orderBy: [{ type: 'asc' }, { machineNumber: 'asc' }],
  });
  return NextResponse.json({ machines });
}

const createMachineSchema = z.object({
  type: z.enum(['WASHER', 'DRYER']),
  machineNumber: z.number().int().min(1).max(999),
  price: z.number().int().min(0).max(1_000_000),
});

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createMachineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const machine = await prisma.machine
    .create({ data: { ...parsed.data, laundromatId: params.id, status: 'AVAILABLE' } })
    .catch(() => null);
  if (!machine) {
    return NextResponse.json({ message: '세탁소를 찾을 수 없거나 같은 번호의 기기가 이미 있습니다.' }, { status: 409 });
  }

  return NextResponse.json({ machine }, { status: 201 });
}
