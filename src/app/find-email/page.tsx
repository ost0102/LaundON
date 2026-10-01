'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Mail, Search, UserSearch } from 'lucide-react';

import { IconField } from '@/components/ui/IconField';
import { useFindEmail } from '@/hooks/useAuth';
import { ApiError } from '@/services/apiClient';

export default function FindEmailPage() {
  const findEmail = useFindEmail();
  const [name, setName] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    findEmail.mutate({ name });
  }

  const errorMessage =
    findEmail.isError && findEmail.error instanceof ApiError ? findEmail.error.message : null;

  return (
    <main className="flex flex-col gap-6 p-4 pb-10">
      <header className="pt-2">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">LaundON</span>
      </header>

      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-500/10">
          <UserSearch className="h-6 w-6 text-sky-600 dark:text-sky-400" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">아이디 찾기</h1>
        <p className="text-xs text-slate-400">가입 시 입력한 이름으로 이메일을 찾아드려요</p>
      </div>

      {findEmail.isSuccess ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-sky-50 px-4 py-6 text-center dark:bg-sky-500/10">
          <Mail className="h-6 w-6 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            회원님의 이메일은
            <br />
            <span className="text-base font-bold text-slate-900 dark:text-slate-50">
              {findEmail.data.email}
            </span>
            <br />
            입니다
          </p>
          <Link
            href="/login"
            className="mt-1 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700"
          >
            로그인하러 가기
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <IconField
            id="name"
            icon={UserSearch}
            label="이름"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          {errorMessage && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={findEmail.isPending || name.trim().length === 0}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition-colors hover:bg-sky-700 disabled:opacity-50 dark:shadow-none"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            {findEmail.isPending ? '찾는 중...' : '이메일 찾기'}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-slate-400">
        <Link href="/reset-password" className="font-medium text-sky-600 underline dark:text-sky-400">
          비밀번호 찾기
        </Link>{' '}
        ·{' '}
        <Link href="/login" className="font-medium text-sky-600 underline dark:text-sky-400">
          로그인
        </Link>
      </p>
    </main>
  );
}
