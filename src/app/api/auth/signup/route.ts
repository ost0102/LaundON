import { NextResponse } from 'next/server';

import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { clearVerification, isEmailVerified } from '@/mocks/emailVerification';
import { createUser, findUserByEmail } from '@/lib/services/users';
import { simulateNetworkDelay } from '@/lib/network';
import { isValidEmail, isValidPassword, PASSWORD_RULE_MESSAGE } from '@/lib/validation';
import type { AuthResponse, SignUpInput } from '@/types/auth';

export async function POST(request: Request) {
  await simulateNetworkDelay();

  const body = (await request.json().catch(() => null)) as Partial<SignUpInput> | null;
  const email = body?.email?.trim() ?? '';
  const password = body?.password ?? '';
  const name = body?.name?.trim() ?? '';

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 });
  }
  if (!isValidPassword(password)) {
    return NextResponse.json({ message: PASSWORD_RULE_MESSAGE }, { status: 400 });
  }
  if (name.length === 0) {
    return NextResponse.json({ message: '이름을 입력해주세요.' }, { status: 400 });
  }

  // Trust the server-side verification record, not a client-supplied flag -
  // the client could otherwise claim "verified: true" without ever
  // confirming the code sent to this email.
  if (!isEmailVerified(email)) {
    return NextResponse.json({ message: '이메일 인증을 완료해주세요.' }, { status: 400 });
  }

  if (await findUserByEmail(email)) {
    return NextResponse.json({ message: '이미 가입된 이메일입니다.' }, { status: 409 });
  }

  const user = await createUser(email, password, name);
  clearVerification(email);

  const response = NextResponse.json<AuthResponse>({ user }, { status: 201 });
  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(user.id, user.role), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
