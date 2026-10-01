/**
 * Stands in for a transactional email provider (e.g. Resend, SendGrid, SMTP)
 * that would actually deliver the verification code to the user's inbox.
 * Wiring a real one later only means swapping the body of
 * issueVerificationCode's "send" step - everything that reads/checks the
 * code stays the same.
 */
interface VerificationRecord {
  code: string;
  expiresAt: number;
  verified: boolean;
  attempts: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __laundryNowEmailVerifications: Map<string, VerificationRecord> | undefined;
}

// See mocks/users.ts for why this needs to live on globalThis rather than a
// plain module-level variable (Next.js bundles each route separately).
const verifications: Map<string, VerificationRecord> = (globalThis.__laundryNowEmailVerifications ??=
  new Map());

const CODE_LENGTH = 6;
const CODE_VALID_FOR_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateCode(): string {
  const max = 10 ** CODE_LENGTH;
  return Math.floor(Math.random() * max)
    .toString()
    .padStart(CODE_LENGTH, '0');
}

export function issueVerificationCode(email: string): string {
  const code = generateCode();
  verifications.set(normalizeEmail(email), {
    code,
    expiresAt: Date.now() + CODE_VALID_FOR_MS,
    verified: false,
    attempts: 0,
  });
  return code;
}

export function confirmVerificationCode(
  email: string,
  code: string,
): { success: true } | { success: false; message: string } {
  const record = verifications.get(normalizeEmail(email));

  if (!record) {
    return { success: false, message: '인증번호를 먼저 요청해주세요.' };
  }
  if (Date.now() > record.expiresAt) {
    return { success: false, message: '인증번호가 만료되었습니다. 다시 요청해주세요.' };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    return { success: false, message: '인증 시도 횟수를 초과했습니다. 다시 요청해주세요.' };
  }

  record.attempts += 1;

  if (record.code !== code) {
    return { success: false, message: '인증번호가 일치하지 않습니다.' };
  }

  record.verified = true;
  return { success: true };
}

export function isEmailVerified(email: string): boolean {
  const record = verifications.get(normalizeEmail(email));
  return Boolean(record?.verified && Date.now() <= record.expiresAt);
}

export function clearVerification(email: string): void {
  verifications.delete(normalizeEmail(email));
}
