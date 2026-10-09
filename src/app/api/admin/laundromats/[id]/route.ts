import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db/prisma';

interface RouteParams {
  params: { id: string };
}

const updateLaundromatSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  address: z.string().trim().min(1).max(300).optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  isOpen: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = updateLaundromatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const laundromat = await prisma.laundromat.update({ where: { id: params.id }, data: parsed.data }).catch(() => null);
  if (!laundromat) return NextResponse.json({ message: '세탁소를 찾을 수 없습니다.' }, { status: 404 });

  return NextResponse.json({ laundromat });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  await prisma.laundromat.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
