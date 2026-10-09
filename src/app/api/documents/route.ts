import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const documents = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { chunks: true } } },
  });
  return NextResponse.json({ documents });
}

const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(20_000),
  sourceUrl: z.string().trim().url().optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const document = await prisma.document.create({ data: parsed.data });
  return NextResponse.json({ document }, { status: 201 });
}
