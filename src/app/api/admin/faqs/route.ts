import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const faqs = await prisma.fAQ.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ faqs });
}

const createFaqSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(2000),
  category: z.string().trim().max(100).optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createFaqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const faq = await prisma.fAQ.create({ data: parsed.data });
  return NextResponse.json({ faq }, { status: 201 });
}
