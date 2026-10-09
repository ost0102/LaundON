import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const sessions = await prisma.chatSession.findMany({
    orderBy: { lastMessageAt: 'desc' },
    take: 50,
    include: {
      user: { select: { email: true, name: true } },
      laundromat: { select: { name: true } },
      _count: { select: { messages: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true, role: true } },
    },
  });

  return NextResponse.json({ sessions });
}
