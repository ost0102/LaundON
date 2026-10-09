import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db/prisma';

interface RouteParams {
  params: { id: string };
}

const updateMachineSchema = z.object({
  status: z.enum(['AVAILABLE', 'RUNNING', 'COMPLETED', 'MAINTENANCE']).optional(),
  price: z.number().int().min(0).max(1_000_000).optional(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = updateMachineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  // Manually forcing status away from RUNNING (e.g. admin marks a machine
  // under maintenance) clears its in-progress cycle so the countdown
  // doesn't linger on a machine that's no longer actually running.
  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status && parsed.data.status !== 'RUNNING') {
    data.startedAt = null;
    data.estimatedEndAt = null;
    data.totalSeconds = null;
    data.programId = null;
  }

  const machine = await prisma.machine.update({ where: { id: params.id }, data }).catch(() => null);
  if (!machine) return NextResponse.json({ message: '기기를 찾을 수 없습니다.' }, { status: 404 });

  if (parsed.data.status) {
    await prisma.machineStatusHistory.create({
      data: { machineId: machine.id, status: machine.status, note: 'admin update' },
    });
  }

  return NextResponse.json({ machine });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  await prisma.machine.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
