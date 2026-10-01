import { NextResponse } from 'next/server';

import { clearVerification, confirmVerificationCode } from '@/mocks/emailVerification';
import { findMockUserByEmail, updateMockUserPassword } from '@/mocks/users';
import { simulateNetworkDelay } from '@/lib/network';
import { isValidPassword, PASSWORD_RULE_MESSAGE } from '@/lib/validation';
import type { ResetPasswordInput, ResetPasswordResponse } from '@/types/auth';

export async function POST(request: Request) {
  await simulateNetworkDelay();

  const body = (await request.json().catch(() => null)) as Partial<ResetPasswordInput> | null;
  const email = body?.email?.trim() ?? '';
  const code = body?.code?.trim() ?? '';
  const newPassword = body?.newPassword ?? '';

  if (!isValidPassword(newPassword)) {
    return NextResponse.json({ message: PASSWORD_RULE_MESSAGE }, { status: 400 });
  }

  if (!findMockUserByEmail(email)) {
    return NextResponse.json({ message: '가입되지 않은 이메일입니다.' }, { status: 404 });
  }

  const result = confirmVerificationCode(email, code);
  if (!result.success) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  updateMockUserPassword(email, newPassword);
  clearVerification(email);

  return NextResponse.json<ResetPasswordResponse>({ success: true });
}
