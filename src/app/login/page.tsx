'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, LogIn, Mail } from 'lucide-react';

import { IconField } from '@/components/ui/IconField';
import { useSignIn } from '@/hooks/useAuth';
import { ApiError } from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const signIn = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && user) {
      router.replace('/home');
    }
  }, [hasHydrated, user, router]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    signIn.mutate({ email, password }, { onSuccess: () => router.push('/home') });
  }

  return (
    <main className="flex flex-col gap-6 p-4 pb-10">
      <header className="pt-2">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">LaundON</span>
      </header>

      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-500/10">
          <LogIn className="h-6 w-6 text-sky-600 dark:text-sky-400" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">로그인</h1>
        <p className="text-xs text-slate-400">세탁소 즐겨찾기와 종료 알림을 이용해보세요</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <IconField
          id="email"
          icon={Mail}
          label="이메일"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <IconField
          id="password"
          icon={Lock}
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {signIn.isError && (
          <p role="alert" className="text-xs font-medium text-rose-600">
            {signIn.error instanceof ApiError ? signIn.error.message : '로그인에 실패했습니다.'}
          </p>
        )}

        <button
          type="submit"
          disabled={signIn.isPending}
          className="rounded-lg bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition-colors hover:bg-sky-700 disabled:opacity-50 dark:shadow-none"
        >
          {signIn.isPending ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
        <Link href="/find-email" className="font-medium text-slate-500 underline dark:text-slate-300">
          아이디 찾기
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/reset-password" className="font-medium text-slate-500 underline dark:text-slate-300">
          비밀번호 찾기
        </Link>
      </p>

      <p className="text-center text-xs text-slate-400">
        아직 계정이 없으신가요?{' '}
        <Link href="/signup" className="font-medium text-sky-600 underline dark:text-sky-400">
          회원가입
        </Link>
      </p>
    </main>
  );
}
