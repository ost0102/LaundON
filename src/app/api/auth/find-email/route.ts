import { NextResponse } from 'next/server';

import { findMockUsersByName } from '@/mocks/users';
import { simulateNetworkDelay } from '@/lib/network';
import { maskEmail } from '@/lib/validation';
import type { FindEmailInput, FindEmailResponse } from '@/types/auth';

export async function POST(request: Request) {
  await simulateNetworkDelay();

  const body = (await request.json().catch(() => null)) as Partial<FindEmailInput> | null;
  const name = body?.name?.trim() ?? '';

  if (name.length === 0) {
    return NextResponse.json({ message: '이름을 입력해주세요.' }, { status: 400 });
  }

  const matches = findMockUsersByName(name);

  // Covers both "no account" and "multiple accounts share this name" with
  // the same response - revealing the count would leak information about
  // other users.
  if (matches.length !== 1) {
    return NextResponse.json({ message: '일치하는 계정을 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json<FindEmailResponse>({ email: maskEmail(matches[0].email) });
}
