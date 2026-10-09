import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db/prisma';

interface RouteParams {
  params: { id: string };
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  await prisma.document.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
