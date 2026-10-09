import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, verifySessionToken, type SessionPayload } from './session';

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE_NAME)?.value);
}

type AdminAuthResult = { ok: true; session: SessionPayload } | { ok: false; response: NextResponse };

/** Guard for admin-only route handlers: `const auth = await requireAdmin(); if (!auth.ok) return auth.response;` */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const session = await getSession();

  if (!session) {
    return { ok: false, response: NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 }) };
  }
  if (session.role !== 'ADMIN') {
    return { ok: false, response: NextResponse.json({ message: '관리자 권한이 필요합니다.' }, { status: 403 }) };
  }

  return { ok: true, session };
}
