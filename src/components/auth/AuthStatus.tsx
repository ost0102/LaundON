'use client';

import Link from 'next/link';
import { LogIn, LogOut, UserCircle2, UserPlus } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';

export function AuthStatus() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (user) {
    return (
      <div className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs">
        <span className="flex max-w-[6rem] items-center gap-1 truncate font-medium text-white">
          <UserCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{user.name}님</span>
        </span>
        <button
          type="button"
          onClick={logout}
          className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-medium text-white transition-colors hover:bg-white/25"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-medium">
      <Link
        href="/login"
        className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-white transition-colors hover:bg-white/25"
      >
        <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
        로그인
      </Link>
      <Link
        href="/signup"
        className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-sky-700 transition-colors hover:bg-sky-50"
      >
        <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
        회원가입
      </Link>
    </div>
  );
}
