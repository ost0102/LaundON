import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const laundromats = await prisma.laundromat.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { machines: true, programs: true } } },
  });
  return NextResponse.json({ laundromats });
}

const createLaundromatSchema = z.object({
  name: z.string().trim().min(1).max(100),
  address: z.string().trim().min(1).max(300),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.string().trim().max(30).optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createLaundromatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const laundromat = await prisma.laundromat.create({ data: parsed.data });
  return NextResponse.json({ laundromat }, { status: 201 });
}
