import { NextResponse } from 'next/server';

import { findMockUserByEmail, toPublicUser, verifyMockUserPassword } from '@/mocks/users';
import { simulateNetworkDelay } from '@/lib/network';
import type { AuthResponse, SignInInput } from '@/types/auth';

export async function POST(request: Request) {
  await simulateNetworkDelay();

  const body = (await request.json().catch(() => null)) as Partial<SignInInput> | null;
  const email = body?.email?.trim() ?? '';
  const password = body?.password ?? '';

  const record = email.length > 0 ? findMockUserByEmail(email) : undefined;

  if (!record || !verifyMockUserPassword(record, password)) {
    return NextResponse.json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' }, { status: 401 });
  }

  return NextResponse.json<AuthResponse>({ user: toPublicUser(record) });
}
