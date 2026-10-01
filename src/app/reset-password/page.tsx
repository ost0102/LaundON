'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CheckCircle2, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react';

import { IconField } from '@/components/ui/IconField';
import { useRequestEmailVerification, useResetPassword } from '@/hooks/useAuth';
import { ApiError } from '@/services/apiClient';
import { isValidEmail, isValidPassword, MAX_PASSWORD_LENGTH, PASSWORD_RULE_MESSAGE } from '@/lib/validation';

export default function ResetPasswordPage() {
  const requestVerification = useRequestEmailVerification();
  const resetPassword = useResetPassword();

  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  function handleEmailChange(value: string) {
    setEmail(value);
    setCodeSent(false);
    setDevCode(null);
    setRequestMessage(null);
  }

  function handleRequestCode() {
    setRequestMessage(null);

    if (!isValidEmail(email)) {
      setRequestMessage('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    requestVerification.mutate(
      { email },
      {
        onSuccess: (data) => {
          setCodeSent(true);
          setDevCode(data.devCode ?? null);
          setRequestMessage(data.message);
        },
        onError: (error) => {
          setRequestMessage(error instanceof ApiError ? error.message : '인증번호 전송에 실패했습니다.');
        },
      },
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!isValidPassword(newPassword)) {
      setFormError(PASSWORD_RULE_MESSAGE);
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setFormError('비밀번호가 일치하지 않습니다.');
      return;
    }

    resetPassword.mutate({ email, code, newPassword });
  }

  const errorMessage =
    formError ??
    (resetPassword.isError && resetPassword.error instanceof ApiError ? resetPassword.error.message : null);

  return (
    <main className="flex flex-col gap-6 p-4 pb-10">
      <header className="pt-2">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">LaundON</span>
      </header>

      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-500/10">
          <KeyRound className="h-6 w-6 text-sky-600 dark:text-sky-400" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">비밀번호 찾기</h1>
        <p className="text-xs text-slate-400">이메일 인증 후 새 비밀번호를 설정해주세요</p>
      </div>

      {resetPassword.isSuccess ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-emerald-50 px-4 py-6 text-center dark:bg-emerald-500/10">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <p className="text-sm text-slate-600 dark:text-slate-300">비밀번호가 재설정되었습니다</p>
          <Link
            href="/login"
            className="mt-1 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700"
          >
            로그인하러 가기
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-slate-600 dark:text-slate-300">
              이메일
            </label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => handleEmailChange(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-sky-500/20"
                />
              </div>
              <button
                type="button"
                onClick={handleRequestCode}
                disabled={requestVerification.isPending}
                className="shrink-0 whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300"
              >
                {codeSent ? '재전송' : '인증번호 받기'}
              </button>
            </div>
          </div>

          {devCode && (
            <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                [테스트용] 이메일 인증번호: <span className="font-bold">{devCode}</span> (실제 서비스에서는
                이메일로 전송됩니다)
              </span>
            </p>
          )}

          {requestMessage && !devCode && <p className="text-xs text-slate-400">{requestMessage}</p>}

          {codeSent && (
            <>
              <IconField
                id="code"
                icon={KeyRound}
                label="인증번호"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="tracking-widest"
              />

              <IconField
                id="newPassword"
                icon={Lock}
                label="새 비밀번호"
                type="password"
                autoComplete="new-password"
                required
                maxLength={MAX_PASSWORD_LENGTH}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <p className="-mt-2.5 text-xs text-slate-400">{PASSWORD_RULE_MESSAGE}</p>

              <IconField
                id="newPasswordConfirm"
                icon={Lock}
                label="새 비밀번호 확인"
                type="password"
                autoComplete="new-password"
                required
                value={newPasswordConfirm}
                onChange={(event) => setNewPasswordConfirm(event.target.value)}
              />
            </>
          )}

          {errorMessage && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {errorMessage}
            </p>
          )}

          {codeSent && (
            <button
              type="submit"
              disabled={resetPassword.isPending || code.length === 0}
              className="rounded-lg bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition-colors hover:bg-sky-700 disabled:opacity-50 dark:shadow-none"
            >
              {resetPassword.isPending ? '변경 중...' : '비밀번호 재설정'}
            </button>
          )}
        </form>
      )}

      <p className="text-center text-xs text-slate-400">
        <Link href="/find-email" className="font-medium text-sky-600 underline dark:text-sky-400">
          아이디 찾기
        </Link>{' '}
        ·{' '}
        <Link href="/login" className="font-medium text-sky-600 underline dark:text-sky-400">
          로그인
        </Link>
      </p>
    </main>
  );
}
