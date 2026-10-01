const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 32;

// Requires at least one letter, one digit, and one special character,
// 8-32 characters total, using only those three character classes.
const PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,32}$/;

export function isValidPassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}

export const PASSWORD_RULE_MESSAGE = `영문, 숫자, 특수문자를 포함해 ${MIN_PASSWORD_LENGTH}~${MAX_PASSWORD_LENGTH}자로 입력해주세요.`;

/** Masks an email for display, e.g. "abcdef@example.com" -> "ab****@example.com". */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;

  if (local.length <= 2) {
    return `${local[0] ?? ''}*@${domain}`;
  }

  const visible = local.slice(0, 2);
  const stars = '*'.repeat(local.length - 2);
  return `${visible}${stars}@${domain}`;
}
