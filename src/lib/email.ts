import nodemailer, { type Transporter } from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_ADDRESS = process.env.EMAIL_FROM || SMTP_USER;

/** True once SMTP credentials are configured - gates real sending vs. the dev-only code fallback. */
export const isRealEmailSendingConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP 환경변수가 설정되지 않았습니다.');
  }

  transporter ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  await getTransporter().sendMail({
    from: FROM_ADDRESS,
    to,
    subject: `[LaundON] 이메일 인증번호 ${code}`,
    html: `
      <p>LaundON 회원가입을 위한 이메일 인증번호입니다.</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px;">${code}</p>
      <p>인증번호는 5분간 유효합니다.</p>
    `,
  });
}
