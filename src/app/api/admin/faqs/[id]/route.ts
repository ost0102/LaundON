import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db/prisma';

interface RouteParams {
  params: { id: string };
}

const updateFaqSchema = z.object({
  question: z.string().trim().min(1).max(300).optional(),
  answer: z.string().trim().min(1).max(2000).optional(),
  category: z.string().trim().max(100).nullable().optional(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = updateFaqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const faq = await prisma.fAQ.update({ where: { id: params.id }, data: parsed.data }).catch(() => null);
  if (!faq) return NextResponse.json({ message: 'FAQ를 찾을 수 없습니다.' }, { status: 404 });

  return NextResponse.json({ faq });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  await prisma.fAQ.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
