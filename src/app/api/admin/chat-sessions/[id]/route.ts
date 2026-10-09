import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db/prisma';

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const session = await prisma.chatSession.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { email: true, name: true } },
      laundromat: { select: { name: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!session) return NextResponse.json({ message: '세션을 찾을 수 없습니다.' }, { status: 404 });
  return NextResponse.json({ session });
}
