'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, KeyRound, Lock, Mail, ShieldCheck, User } from 'lucide-react';

import { IconField } from '@/components/ui/IconField';
import { useConfirmEmailVerification, useRequestEmailVerification, useSignUp } from '@/hooks/useAuth';
import { ApiError } from '@/services/apiClient';
import { isValidEmail, isValidPassword, MAX_PASSWORD_LENGTH, PASSWORD_RULE_MESSAGE } from '@/lib/validation';
import { useAuthStore } from '@/stores/authStore';

type VerificationStatus = 'idle' | 'sent' | 'verified';

export default function SignUpPage() {
  const router = useRouter();
  const signUp = useSignUp();
  const requestVerification = useRequestEmailVerification();
  const confirmVerification = useConfirmEmailVerification();

  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && user) {
      router.replace('/home');
    }
  }, [hasHydrated, user, router]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);

  function handleEmailChange(value: string) {
    setEmail(value);
    // A new/edited address invalidates whatever verification we had going -
    // the server tracks the code per email address.
    setVerificationStatus('idle');
    setVerificationCode('');
    setDevCode(null);
    setVerificationMessage(null);
  }

  function handleRequestCode() {
    setVerificationMessage(null);

    if (!isValidEmail(email)) {
      setVerificationMessage('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    requestVerification.mutate(
      { email },
      {
        onSuccess: (data) => {
          setVerificationStatus('sent');
          setDevCode(data.devCode ?? null);
          setVerificationMessage(data.message);
        },
        onError: (error) => {
          setVerificationMessage(error instanceof ApiError ? error.message : '인증번호 전송에 실패했습니다.');
        },
      },
    );
  }

  function handleConfirmCode() {
    setVerificationMessage(null);

    confirmVerification.mutate(
      { email, code: verificationCode },
      {
        onSuccess: () => {
          setVerificationStatus('verified');
          setVerificationMessage('이메일 인증이 완료되었습니다.');
        },
        onError: (error) => {
          setVerificationMessage(error instanceof ApiError ? error.message : '인증에 실패했습니다.');
        },
      },
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!isValidPassword(password)) {
      setFormError(PASSWORD_RULE_MESSAGE);
      return;
    }
    if (password !== passwordConfirm) {
      setFormError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (verificationStatus !== 'verified') {
      setFormError('이메일 인증을 완료해주세요.');
      return;
    }

    signUp.mutate(
      { name, email, password },
      {
        onSuccess: () => router.push('/home'),
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            window.alert(error.message);
          }
        },
      },
    );
  }

  const errorMessage =
    formError ?? (signUp.isError && signUp.error instanceof ApiError ? signUp.error.message : null);

  return (
    <main className="flex flex-col gap-6 p-4 pb-10">
      <header className="pt-2">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">LaundON</span>
      </header>

      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-500/10">
          <User className="h-6 w-6 text-sky-600 dark:text-sky-400" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">회원가입</h1>
        <p className="text-xs text-slate-400">몇 가지 정보만 입력하면 바로 시작할 수 있어요</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <IconField
          id="name"
          icon={User}
          label="이름"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

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
                disabled={verificationStatus === 'verified'}
                value={email}
                onChange={(event) => handleEmailChange(event.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-sky-500/20 dark:disabled:bg-slate-800"
              />
            </div>
            <button
              type="button"
              onClick={handleRequestCode}
              disabled={requestVerification.isPending || verificationStatus === 'verified'}
              className="shrink-0 whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300"
            >
              {verificationStatus === 'idle' ? '인증번호 받기' : '재전송'}
            </button>
          </div>

          {verificationStatus !== 'verified' && (
            <p className="text-xs text-slate-400">이메일로 전송된 인증번호를 입력해주세요</p>
          )}
        </div>

        {verificationStatus !== 'idle' && verificationStatus !== 'verified' && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="code" className="text-xs font-medium text-slate-600 dark:text-slate-300">
              인증번호
            </label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <KeyRound
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm tracking-widest transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-sky-500/20"
                />
              </div>
              <button
                type="button"
                onClick={handleConfirmCode}
                disabled={confirmVerification.isPending || verificationCode.length === 0}
                className="shrink-0 rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
              >
                인증 확인
              </button>
            </div>
          </div>
        )}

        {verificationStatus === 'verified' && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            이메일 인증이 완료되었습니다
          </p>
        )}

        {devCode && (
          <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              [테스트용] 이메일 인증번호: <span className="font-bold">{devCode}</span> (실제 서비스에서는
              이메일로 전송됩니다)
            </span>
          </p>
        )}

        {verificationMessage && !devCode && <p className="text-xs text-slate-400">{verificationMessage}</p>}

        <IconField
          id="password"
          icon={Lock}
          label="비밀번호"
          type="password"
          autoComplete="new-password"
          required
          maxLength={MAX_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <p className="-mt-2.5 text-xs text-slate-400">{PASSWORD_RULE_MESSAGE}</p>

        <IconField
          id="passwordConfirm"
          icon={Lock}
          label="비밀번호 확인"
          type="password"
          autoComplete="new-password"
          required
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
        />

        {errorMessage && (
          <p role="alert" className="text-xs font-medium text-rose-600">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={signUp.isPending || verificationStatus !== 'verified'}
          className="rounded-lg bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition-colors hover:bg-sky-700 disabled:opacity-50 dark:shadow-none"
        >
          {signUp.isPending ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-medium text-sky-600 underline dark:text-sky-400">
          로그인
        </Link>
      </p>
    </main>
  );
}
