import { createHmac, timingSafeEqual } from 'node:crypto';

import type { UserRole } from '@/types/auth';

export const SESSION_COOKIE_NAME = 'laundon_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface SessionPayload {
  sub: string;
  role: UserRole;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET 환경변수가 설정되지 않았습니다.');
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

/** Stateless signed session token - "{payload}.{hmac}", same pattern as the rest of this codebase's hand-rolled crypto (see mocks/users.ts). */
export function createSessionToken(userId: string, role: UserRole): string {
  const payload: SessionPayload = { sub: userId, role, exp: Date.now() + SESSION_TTL_MS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expectedSig = sign(encoded);
  const given = Buffer.from(signature);
  const expected = Buffer.from(expectedSig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
