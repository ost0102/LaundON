import { NextResponse } from 'next/server';

import { confirmVerificationCode } from '@/mocks/emailVerification';
import { simulateNetworkDelay } from '@/lib/network';
import type { ConfirmVerificationInput, ConfirmVerificationResponse } from '@/types/auth';

export async function POST(request: Request) {
  await simulateNetworkDelay();

  const body = (await request.json().catch(() => null)) as Partial<ConfirmVerificationInput> | null;
  const email = body?.email?.trim() ?? '';
  const code = body?.code?.trim() ?? '';

  if (email.length === 0 || code.length === 0) {
    return NextResponse.json({ message: '이메일과 인증번호를 입력해주세요.' }, { status: 400 });
  }

  const result = confirmVerificationCode(email, code);

  if (!result.success) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json<ConfirmVerificationResponse>({ verified: true });
}
