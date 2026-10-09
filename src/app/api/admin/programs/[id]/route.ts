import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db/prisma';

interface RouteParams {
  params: { id: string };
}

const updateProgramSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  durationMinutes: z.number().int().min(1).max(300).optional(),
  price: z.number().int().min(0).max(1_000_000).optional(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = updateProgramSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const program = await prisma.laundryProgram.update({ where: { id: params.id }, data: parsed.data }).catch(() => null);
  if (!program) return NextResponse.json({ message: '코스를 찾을 수 없습니다.' }, { status: 404 });

  return NextResponse.json({ program });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  await prisma.laundryProgram.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
