import { NextResponse } from 'next/server';

import { isRealEmailSendingConfigured, sendVerificationEmail } from '@/lib/email';
import { issueVerificationCode } from '@/mocks/emailVerification';
import { simulateNetworkDelay } from '@/lib/network';
import { isValidEmail } from '@/lib/validation';
import type { RequestVerificationInput, RequestVerificationResponse } from '@/types/auth';

export async function POST(request: Request) {
  await simulateNetworkDelay();

  const body = (await request.json().catch(() => null)) as Partial<RequestVerificationInput> | null;
  const email = body?.email?.trim() ?? '';

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 });
  }

  const code = issueVerificationCode(email);

  if (!isRealEmailSendingConfigured) {
    // No email provider configured - fall back to handing the code straight
    // back to the client (non-production only) so local development still
    // works without a Resend account.
    return NextResponse.json<RequestVerificationResponse>({
      message: '이메일로 인증번호를 전송했습니다.',
      devCode: process.env.NODE_ENV === 'production' ? undefined : code,
    });
  }

  try {
    await sendVerificationEmail(email, code);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '이메일 전송에 실패했습니다.' },
      { status: 502 },
    );
  }

  return NextResponse.json<RequestVerificationResponse>({ message: '이메일로 인증번호를 전송했습니다.' });
}
