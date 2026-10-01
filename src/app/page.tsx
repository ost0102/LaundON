'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner';
import { useAuthStore } from '@/stores/authStore';

/** Entry point - sends the visitor to /home if logged in, /login otherwise. */
export default function RootPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    router.replace(user ? '/home' : '/login');
  }, [hasHydrated, user, router]);

  return <FullScreenSpinner />;
}
