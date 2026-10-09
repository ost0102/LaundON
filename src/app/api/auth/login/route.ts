import { NextResponse } from 'next/server';

import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { findUserByEmail, toPublicUser, verifyUserPassword } from '@/lib/services/users';
import { simulateNetworkDelay } from '@/lib/network';
import type { AuthResponse, SignInInput } from '@/types/auth';

export async function POST(request: Request) {
  await simulateNetworkDelay();

  const body = (await request.json().catch(() => null)) as Partial<SignInInput> | null;
  const email = body?.email?.trim() ?? '';
  const password = body?.password ?? '';

  const record = email.length > 0 ? await findUserByEmail(email) : null;

  if (!record || !verifyUserPassword(record, password)) {
    return NextResponse.json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' }, { status: 401 });
  }

  const response = NextResponse.json<AuthResponse>({ user: toPublicUser(record) });
  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(record.id, record.role), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
