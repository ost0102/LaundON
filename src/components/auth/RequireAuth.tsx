'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner';
import { useAuthStore } from '@/stores/authStore';

/** Gates a page behind login - renders children only once a session is confirmed present. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !user) {
      router.replace('/login');
    }
  }, [hasHydrated, user, router]);

  if (!hasHydrated || !user) {
    return <FullScreenSpinner />;
  }

  return <>{children}</>;
}
