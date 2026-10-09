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

  const programs = await prisma.laundryProgram.findMany({
    where: { laundromatId: params.id },
    orderBy: [{ machineType: 'asc' }, { price: 'asc' }],
  });
  return NextResponse.json({ programs });
}

const createProgramSchema = z.object({
  machineType: z.enum(['WASHER', 'DRYER']),
  name: z.string().trim().min(1).max(50),
  durationMinutes: z.number().int().min(1).max(300),
  price: z.number().int().min(0).max(1_000_000),
});

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createProgramSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const program = await prisma.laundryProgram
    .create({ data: { ...parsed.data, laundromatId: params.id } })
    .catch(() => null);
  if (!program) return NextResponse.json({ message: '세탁소를 찾을 수 없습니다.' }, { status: 404 });

  return NextResponse.json({ program }, { status: 201 });
}
